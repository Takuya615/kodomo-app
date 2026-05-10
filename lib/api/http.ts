export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function errorBody(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string };
    return typeof j.error === "string" ? j.error : res.statusText;
  } catch {
    return res.statusText;
  }
}

export function adminHeaders(token: string): HeadersInit {
  return { "x-admin-token": token };
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  if (!res.ok) throw new ApiError(res.status, await errorBody(res));
  return res.json() as Promise<T>;
}

function mergeHeaders(extra?: HeadersInit): HeadersInit {
  const h = new Headers({ "Content-Type": "application/json" });
  if (!extra) return h;
  const e = new Headers(extra);
  e.forEach((v, k) => h.set(k, v));
  return h;
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  headers?: HeadersInit
): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: mergeHeaders(headers),
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new ApiError(res.status, await errorBody(res));
  return res.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  headers?: HeadersInit
): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: mergeHeaders(headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (!res.ok) throw new ApiError(res.status, await errorBody(res));
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string, headers?: HeadersInit): Promise<void> {
  const res = await fetch(path, {
    method: "DELETE",
    credentials: "include",
    headers,
  });
  if (!res.ok) throw new ApiError(res.status, await errorBody(res));
}
