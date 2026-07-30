/**
 * OAuth 2.0 with PKCE for interactive sign-in.
 * - Dynamic client registration (RFC 7591)
 * - Authorization Code with PKCE
 * - Token refresh
 * - Credential storage (per-platform)
 */

import { createServer } from "node:http";
import { randomBytes, createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_ISSUER = "https://auth.hostinger.com";

interface OAuthCredentials {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // epoch ms
  client_id: string;
  client_secret?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

function getCredentialsPath(): string {
  if (process.platform === "win32") {
    const appdata = process.env.APPDATA || join(homedir(), "AppData", "Roaming");
    return join(appdata, "hostinger-mcp", "credentials.json");
  }
  return join(homedir(), ".config", "hostinger-mcp", "credentials.json");
}

async function loadCredentials(): Promise<OAuthCredentials | null> {
  const p = getCredentialsPath();
  if (!existsSync(p)) return null;
  try {
    const raw = await readFile(p, "utf-8");
    return JSON.parse(raw) as OAuthCredentials;
  } catch {
    return null;
  }
}

async function saveCredentials(creds: OAuthCredentials): Promise<void> {
  const p = getCredentialsPath();
  const dir = join(p, "..");
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(p, JSON.stringify(creds, null, 2), { mode: 0o600 });
}

export async function clearCredentials(): Promise<void> {
  const p = getCredentialsPath();
  if (existsSync(p)) {
    const { unlink } = await import("node:fs/promises");
    await unlink(p);
  }
}

function base64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function generateCodeVerifier(): string {
  return base64url(randomBytes(32));
}

function generateCodeChallenge(verifier: string): string {
  return base64url(createHash("sha256").update(verifier).digest());
}

function generateState(): string {
  return base64url(randomBytes(16));
}

async function registerClient(issuer: string): Promise<{ client_id: string; client_secret?: string }> {
  const regUrl = `${issuer}/oauth2/register`;
  const res = await fetch(regUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "Hostinger MCP Server",
      redirect_uris: ["http://127.0.0.1:0/callback"],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth client registration failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as any;
  return { client_id: data.client_id, client_secret: data.client_secret };
}

async function exchangeCode(
  issuer: string,
  clientId: string,
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const tokenUrl = `${issuer}/oauth2/token`;
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  return (await res.json()) as TokenResponse;
}

async function refreshToken(
  issuer: string,
  clientId: string,
  refreshTok: string,
): Promise<TokenResponse> {
  const tokenUrl = `${issuer}/oauth2/token`;
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshTok,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }

  return (await res.json()) as TokenResponse;
}

/**
 * Perform interactive OAuth login. Opens browser, captures code on local server.
 */
export async function oauthLogin(issuer?: string): Promise<string> {
  const iss = issuer || process.env.OAUTH_ISSUER || DEFAULT_ISSUER;

  // Register dynamic client
  process.stderr.write("Registering OAuth client...\n");
  const { client_id, client_secret } = await registerClient(iss);

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Start local server to capture redirect
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url || "/", `http://127.0.0.1`);
        if (url.pathname !== "/callback") {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) {
          res.writeHead(400);
          res.end(`OAuth error: ${error}`);
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (!code || returnedState !== state) {
          res.writeHead(400);
          res.end("Invalid callback");
          server.close();
          reject(new Error("Invalid OAuth callback"));
          return;
        }

        const addr = server.address() as any;
        const redirectUri = `http://127.0.0.1:${addr.port}/callback`;

        const tokens = await exchangeCode(iss, client_id, code, codeVerifier, redirectUri);

        const creds: OAuthCredentials = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + tokens.expires_in * 1000,
          client_id,
          client_secret,
        };
        await saveCredentials(creds);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<html><body><h2>Login successful!</h2><p>You can close this window.</p></body></html>");
        server.close();
        resolve(tokens.access_token);
      } catch (err: any) {
        res.writeHead(500);
        res.end("Internal error");
        server.close();
        reject(err);
      }
    });

    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as any;
      const redirectUri = `http://127.0.0.1:${addr.port}/callback`;
      const authUrl = new URL(`${iss}/oauth2/auth`);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", client_id);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", "openid");
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("code_challenge", codeChallenge);
      authUrl.searchParams.set("code_challenge_method", "S256");

      const loginUrl = authUrl.toString();
      process.stderr.write(`\nOpen this URL to sign in:\n${loginUrl}\n\n`);

      // Try to open browser
      openBrowser(loginUrl).catch(() => {
        process.stderr.write("Could not open browser automatically. Please open the URL above.\n");
      });
    });

    server.on("error", reject);
  });
}

/**
 * Get a valid access token — refreshes if expired, re-authenticates if needed.
 */
export async function getOAuthToken(): Promise<string> {
  const creds = await loadCredentials();
  if (!creds) {
    return oauthLogin();
  }

  // Token still valid (with 60s buffer)
  if (Date.now() < creds.expires_at - 60_000) {
    return creds.access_token;
  }

  // Try refresh
  if (creds.refresh_token) {
    const iss = process.env.OAUTH_ISSUER || DEFAULT_ISSUER;
    try {
      const tokens = await refreshToken(iss, creds.client_id, creds.refresh_token);
      const updated: OAuthCredentials = {
        ...creds,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? creds.refresh_token,
        expires_at: Date.now() + tokens.expires_in * 1000,
      };
      await saveCredentials(updated);
      return updated.access_token;
    } catch {
      // Refresh failed — re-login
      return oauthLogin();
    }
  }

  // No refresh token — re-login
  return oauthLogin();
}

async function openBrowser(url: string): Promise<void> {
  const { exec } = await import("node:child_process");
  const cmd = process.platform === "win32"
    ? `start "" "${url}"`
    : process.platform === "darwin"
      ? `open "${url}"`
      : `xdg-open "${url}"`;

  return new Promise((resolve, reject) => {
    exec(cmd, (err) => (err ? reject(err) : resolve()));
  });
}
