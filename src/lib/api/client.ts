import { env } from "@/config/env";
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
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
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

async function request<T>(
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

  if (options.authToken) {
    headers.set("Authorization", `Bearer ${options.authToken}`);
  }

  try {
    const response = await fetch(buildUrl(path), {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal ?? controller.signal,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
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
