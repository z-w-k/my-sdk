export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
export type ResponseType = "json" | "text" | "blob" | "arraybuffer";

export interface CacheConfig {
  enabled?: boolean;
  ttl?: number; // 毫秒
  maxEntries?: number;
  storage?: 'memory' | 'localStorage' | 'custom';
}

export interface Metrics {
  requestDuration: number;
  success: boolean;
  statusCode?: number;
  retryCount: number;
}

export interface SDKConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryConfig?: RetryConfig;
  cacheConfig?: CacheConfig;
}

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: SDKError) => boolean;
}

export interface RequestConfig<D = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  data?: D;
  timeout?: number;
  signal?: AbortSignal;
  withCredentials?: boolean;
  responseType?: ResponseType;
  cache?: CacheConfig;
  deduplicate?: boolean;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

export interface SDKError {
  message: string;
  code?: string;
  status?: number;
  response?: ApiResponse;
  isNetworkError: boolean;
  isTimeout: boolean;
  originalError?: Error;
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor<T = unknown> = (response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
export type ErrorInterceptor = (error: SDKError) => SDKError | Promise<SDKError>;
export type ResponseValidator<T = unknown> = (data: T) => boolean;

export interface InterceptorManager {
  add(interceptor: RequestInterceptor): number;
  remove(id: number): void;
  clear(): void;
}
