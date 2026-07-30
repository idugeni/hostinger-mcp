import type { ApiResponse } from "./api-client.js";

export function formatResult(res: ApiResponse) {
  const body = JSON.stringify(res.data, null, 2);
  if (res.status >= 200 && res.status < 300) {
    return { content: [{ type: "text" as const, text: body }] };
  }
  return {
    content: [{ type: "text" as const, text: `HTTP ${res.status}\n${body}` }],
    isError: true,
  };
}
