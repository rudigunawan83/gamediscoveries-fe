export interface ApiError {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

export interface ApiMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: ApiError | null;
  meta: ApiMeta | null;
}

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: ApiMeta;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly payload: ApiError | null;

  constructor(message: string, status: number, payload: ApiError | null = null) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}
