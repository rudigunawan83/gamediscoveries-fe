import { env } from "@/config/env";
import { getAuthToken, notifyUnauthorized } from "@/lib/auth/token";
import {
  ApiClientError,
  type ApiError,
  type ApiResponse,
} from "@/lib/api/types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
  authToken?: string;
}

const DEFAULT_TIMEOUT_MS = 15_000;

function buildUrl(path: string): string {
  // Prefer internal Docker DNS on the server to avoid shared public rate limits.
  const serverBase =
    typeof window === "undefined" ? process.env.INTERNAL_API_URL : undefined;
  const base = (serverBase || env.NEXT_PUBLIC_API_URL).replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function normalizeApiError(
  status: number,
  body: unknown,
  fallbackMessage = "Request failed",
): ApiClientError {
  if (body && typeof body === "object") {
    const maybeWrapped = body as Partial<ApiResponse<unknown>>;
    if (maybeWrapped.error) {
      return new ApiClientError(
        maybeWrapped.error.detail ||
          maybeWrapped.error.title ||
          fallbackMessage,
        status,
        maybeWrapped.error,
      );
    }

    const problem = body as ApiError;
    if (problem.title || problem.detail || problem.status) {
      return new ApiClientError(
        problem.detail || problem.title || fallbackMessage,
        status,
        problem,
      );
    }
  }

  return new ApiClientError(fallbackMessage, status, {
    status,
    title: fallbackMessage,
    detail: typeof body === "string" ? body : fallbackMessage,
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestOnce<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const token = options.authToken ?? getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const method = options.method ?? "GET";
  const skipUnauthorizedRedirect =
    path.includes("/api/v1/auth/login") ||
    path.includes("/api/v1/auth/register") ||
    path.includes("/api/v1/auth/logout");

  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal ?? controller.signal,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401 && !skipUnauthorizedRedirect) {
        notifyUnauthorized();
      }
      throw normalizeApiError(response.status, payload);
    }

    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      "data" in payload
    ) {
      return payload as ApiResponse<T>;
    }

    return {
      success: true,
      data: payload as T,
      error: null,
      meta: null,
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiClientError("Request timed out", 408);
    }

    throw new ApiClientError(
      error instanceof Error ? error.message : "Unexpected network error",
      0,
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const method = options.method ?? "GET";
  const isMutation = method !== "GET";
  const maxAttempts = isMutation ? 1 : 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await requestOnce<T>(path, options);
    } catch (error) {
      const retryable =
        !isMutation &&
        error instanceof ApiClientError &&
        (error.status === 429 || error.status === 408 || error.status === 0);

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      await sleep(400 * attempt);
    }
  }

  throw new ApiClientError("Unexpected network error", 0);
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
