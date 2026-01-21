import {
  DEFAULT_TIMEOUT,
  DEFAULT_BASE_URL,
  deepMerge,
  type SDKConfig,
  type RequestOptions,
  type ApiResponse,
} from "@my-sdk/core";

export interface HttpClientConfig extends SDKConfig {
  retries?: number;
  retryDelay?: number;
}

export class HttpClient {
  private config: Required<HttpClientConfig>;

  constructor(config: Partial<HttpClientConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      headers: config.headers ?? {},
      retries: config.retries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const headers = deepMerge(
      { "Content-Type": "application/json" },
      this.config.headers,
      options.headers ?? {}
    );

    try {
      const response = await fetch(url, {
        method: options.method ?? "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: options.signal ?? controller.signal,
      });

      const data = (await response.json()) as T;

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }
}
