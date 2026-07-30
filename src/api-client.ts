/**
 * Hostinger API Client — production-grade HTTP client
 * Features: retry with exponential backoff, rate-limit handling (429),
 * response caching (GET), smart pagination, timeout control.
 */

const BASE_URL = "https://developers.hostinger.com";

export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  headers: Headers;
  cached?: boolean;
}

export interface ClientOptions {
  token?: string;
  getToken?: () => Promise<string>;
  maxRetries?: number;
  retryBaseMs?: number;
  timeoutMs?: number;
  cacheTtlMs?: number;
}

interface CacheEntry {
  response: ApiResponse;
  expiresAt: number;
}

export class HostingerApiClient {
  #token?: string;
  #getToken?: () => Promise<string>;
  readonly #maxRetries: number;
  readonly #retryBaseMs: number;
  readonly #timeoutMs: number;
  readonly #cacheTtlMs: number;
  readonly #cache = new Map<string, CacheEntry>();

  constructor(opts: ClientOptions | string) {
    if (typeof opts === "string") {
      this.#token = opts;
      this.#maxRetries = 3;
      this.#retryBaseMs = 1000;
      this.#timeoutMs = 30_000;
      this.#cacheTtlMs = 15_000;
    } else {
      this.#token = opts.token;
      this.#getToken = opts.getToken;
      this.#maxRetries = opts.maxRetries ?? 3;
      this.#retryBaseMs = opts.retryBaseMs ?? 1000;
      this.#timeoutMs = opts.timeoutMs ?? 30_000;
      this.#cacheTtlMs = opts.cacheTtlMs ?? 15_000;
    }
  }

  /** Update token (e.g. after OAuth refresh) */
  setToken(token: string) {
    this.#token = token;
  }

  private async resolveToken(): Promise<string> {
    if (this.#token) return this.#token;
    if (this.#getToken) {
      this.#token = await this.#getToken();
      return this.#token;
    }
    throw new Error("No API token configured");
  }

  /** Clear response cache */
  clearCache() {
    this.#cache.clear();
  }

  private getCacheKey(method: string, url: string): string | null {
    if (method !== "GET") return null;
    return url;
  }

  private getFromCache(key: string): ApiResponse | null {
    const entry = this.#cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.#cache.delete(key);
      return null;
    }
    return { ...entry.response, cached: true };
  }

  private setCache(key: string, response: ApiResponse) {
    // Only cache successful responses
    if (response.status < 200 || response.status >= 300) return;
    this.#cache.set(key, {
      response,
      expiresAt: Date.now() + this.#cacheTtlMs,
    });
    // Evict old entries if cache grows too large
    if (this.#cache.size > 500) {
      const now = Date.now();
      for (const [k, v] of this.#cache) {
        if (v.expiresAt < now) this.#cache.delete(k);
      }
    }
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    queryParams?: Record<string, string | undefined>,
  ): Promise<ApiResponse<T>> {
    const url = new URL(path, BASE_URL);
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value != null && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }

    const fullUrl = url.toString();
    const cacheKey = this.getCacheKey(method.toUpperCase(), fullUrl);

    // Check cache for GET
    if (cacheKey) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached as ApiResponse<T>;
    }

    const token = await this.resolveToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    let payload: string | undefined;
    if (body !== undefined) {
      payload = JSON.stringify(body);
      headers["Content-Type"] = "application/json";
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.#maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.#timeoutMs);

        const res = await fetch(url, {
          method: method.toUpperCase(),
          headers,
          body: payload,
          signal: controller.signal,
        });

        clearTimeout(timer);

        // Rate limited — wait and retry
        if (res.status === 429) {
          const retryAfter = res.headers.get("retry-after");
          const waitMs = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : this.#retryBaseMs * 2 ** attempt;
          await this.sleep(waitMs);
          continue;
        }

        // Server error — retry with backoff
        if (res.status >= 500 && attempt < this.#maxRetries) {
          await this.sleep(this.#retryBaseMs * 2 ** attempt);
          continue;
        }

        let data: T;
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          data = (await res.json()) as T;
        } else {
          const text = await res.text();
          data = (text || null) as unknown as T;
        }

        const response: ApiResponse<T> = { status: res.status, data, headers: res.headers };

        // Cache successful GET
        if (cacheKey) {
          this.setCache(cacheKey, response as ApiResponse);
        }

        return response;
      } catch (err: any) {
        lastError = err;
        if (err.name === "AbortError") {
          lastError = new Error(`Request timeout after ${this.#timeoutMs}ms: ${method} ${path}`);
        }
        if (attempt < this.#maxRetries) {
          await this.sleep(this.#retryBaseMs * 2 ** attempt);
          continue;
        }
      }
    }

    throw lastError ?? new Error(`Request failed: ${method} ${path}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  // === Convenience methods ===

  get<T = unknown>(path: string, query?: Record<string, string | undefined>) {
    return this.request<T>("GET", path, undefined, query);
  }

  post<T = unknown>(path: string, body?: unknown) {
    return this.request<T>("POST", path, body);
  }

  put<T = unknown>(path: string, body?: unknown) {
    return this.request<T>("PUT", path, body);
  }

  patch<T = unknown>(path: string, body?: unknown) {
    return this.request<T>("PATCH", path, body);
  }

  delete<T = unknown>(path: string, body?: unknown, query?: Record<string, string | undefined>) {
    return this.request<T>("DELETE", path, body, query);
  }

  // === Smart pagination ===

  /**
   * Auto-paginate a GET endpoint. Fetches all pages and merges results.
   * Assumes API uses `page` query param and response has `data` array + `meta.last_page`.
   */
  async paginate<T = unknown>(
    path: string,
    query?: Record<string, string | undefined>,
    maxPages = 50,
  ): Promise<T[]> {
    const allItems: T[] = [];
    let page = 1;

    while (page <= maxPages) {
      const q = { ...query, page: String(page) };
      const res = await this.get<any>(path, q);

      if (res.status !== 200) break;

      const data = res.data;
      if (Array.isArray(data)) {
        allItems.push(...data);
        // If we got fewer items than a typical page, assume last page
        if (data.length === 0) break;
        // Simple heuristic: if less than 25 items, likely last page
        if (data.length < 25) break;
      } else if (data?.data && Array.isArray(data.data)) {
        allItems.push(...data.data);
        const lastPage = data.meta?.last_page ?? data.last_page ?? page;
        if (page >= lastPage) break;
      } else {
        // Non-paginated response
        allItems.push(data);
        break;
      }

      page++;
    }

    return allItems;
  }
}
