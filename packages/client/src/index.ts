/**
 * ZHJ SDK HTTP Client - 企业级 HTTP 客户端库
 * 
 * 提供完整的 HTTP 请求功能，包括：
 * - 类型安全的请求/响应处理
 * - 智能缓存机制
 * - 请求去重和取消
 * - 自动重试机制
 * - 指标收集和监控
 * - 响应验证
 * - 拦截器管理
 * 
 * @author ZHJ SDK Team
 * @version 1.0.0
 */
import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { deepMerge } from "@zhj-sdk/utils";
import { DEFAULT_TIMEOUT } from "./constants";
import {
  SDKConfig,
  RequestConfig,
  ApiResponse,
  SDKError,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  ResponseValidator,
  Metrics,
} from "./types";
import {
  CacheManager,
  MetricsCollector,
  RequestManager,
  InterceptorManager,
  ValidatorManager,
  RetryManager,
} from "./modules";

/**
 * HTTP 客户端配置接口
 * 
 * 继承自 SDKConfig，扩展了 HTTP 客户端特有的配置选项
 */
export interface HttpClientConfig extends SDKConfig {
  /**
   * HTTP 状态码验证函数
   * @param status - HTTP 状态码
   * @returns 是否为有效状态码
   */
  validateStatus?: (status: number) => boolean;
}

/**
 * HTTP 客户端主类
 * 
 * 提供完整的 HTTP 请求功能，采用模块化设计，每个功能模块职责单一
 * 
 * @example
 * ```typescript
 * const client = new HttpClient({
 *   baseUrl: 'https://api.example.com',
 *   timeout: 10000,
 *   cacheConfig: { enabled: true, ttl: 60000 },
 *   retryConfig: { maxRetries: 3, retryDelay: 1000 }
 * });
 * ```
 */
export class HttpClient {
  /** Axios 实例，用于底层 HTTP 请求 */
  private axiosInstance: AxiosInstance;
  /** 客户端配置 */
  private config: HttpClientConfig;
  
  // 模块化组件 - 每个模块负责特定功能
  /** 缓存管理器 - 处理请求缓存 */
  private cacheManager: CacheManager;
  /** 指标收集器 - 收集请求性能指标 */
  private metricsCollector: MetricsCollector;
  /** 请求管理器 - 处理请求去重、取消和键生成 */
  private requestManager: RequestManager;
  /** 拦截器管理器 - 管理请求、响应和错误拦截器 */
  private interceptorManager: InterceptorManager;
  /** 验证器管理器 - 管理响应验证器 */
  private validatorManager: ValidatorManager;
  /** 重试管理器 - 处理请求重试逻辑 */
  private retryManager: RetryManager;
  
  /** Axios 拦截器 ID 列表，用于清理 */
  private interceptorIds: number[] = [];

  /**
   * 创建 HTTP 客户端实例
   * 
   * @param config - 客户端配置
   */
  constructor(config: HttpClientConfig) {
    // 合并默认配置
    this.config = {
      timeout: DEFAULT_TIMEOUT,
      validateStatus: (status: number) => status >= 200 && status < 300,
      retryConfig: { maxRetries: 0, retryDelay: 1000 },
      cacheConfig: { enabled: false, ttl: 60000, maxEntries: 100 },
      ...config,
    };

    // 初始化所有功能模块
    this.metricsCollector = new MetricsCollector();
    this.cacheManager = new CacheManager();
    this.requestManager = new RequestManager();
    this.interceptorManager = new InterceptorManager();
    this.validatorManager = new ValidatorManager();
    this.retryManager = new RetryManager(this.metricsCollector);

    // 创建 Axios 实例
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: this.config.headers ? deepMerge({}, this.config.headers) : {},
      validateStatus: this.config.validateStatus,
    });

    // 设置请求和响应拦截器
    this.setupInterceptors();
  }

  /**
   * 设置 Axios 拦截器
   * 
   * 包括请求拦截器和响应拦截器，用于处理请求预处理、响应后处理和错误处理
   */
  private setupInterceptors(): void {
    // 请求拦截器 - 处理请求预处理
    const requestInterceptorId = this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // 转换配置格式
        let requestConfig: RequestConfig = this.axiosConfigToRequestConfig(config);
        // 执行请求拦截器链
        requestConfig = await this.interceptorManager.processRequest(requestConfig);
        // 转换回 Axios 配置
        return this.requestConfigToAxiosConfig(requestConfig, config);
      },
      // 请求错误处理
      (error) => {
        const normalizedError = this.normalizeError(error);
        return this.interceptorManager.processError(normalizedError).then(processedError => {
          return Promise.reject(processedError);
        });
      }
    );

    this.interceptorIds.push(requestInterceptorId);

    // 响应拦截器 - 处理响应后处理
    this.axiosInstance.interceptors.response.use(
      async (response: AxiosResponse) => {
        // 转换响应格式
        let apiResponse = this.axiosResponseToApiResponse(response);
        // 执行响应拦截器链
        apiResponse = await this.interceptorManager.processResponse(apiResponse);
        return this.apiResponseToAxiosResponse(apiResponse, response);
      },
      async (error: AxiosError) => {
        let sdkError = this.normalizeError(error);
        sdkError = await this.interceptorManager.processError(sdkError);
        return Promise.reject(sdkError);
      }
    );
  }

  /**
   * 将 Axios 配置转换为请求配置
   * 
   * @param config - Axios 配置
   * @returns 请求配置
   */
  private axiosConfigToRequestConfig(config: InternalAxiosRequestConfig): RequestConfig {
    return {
      method: config.method?.toUpperCase() as RequestConfig["method"],
      headers: config.headers as unknown as Record<string, string>,
      params: config.params,
      data: config.data,
      timeout: config.timeout,
      signal: config.signal as AbortSignal | undefined,
      withCredentials: config.withCredentials,
      responseType: config.responseType as RequestConfig["responseType"],
    };
  }

  /**
   * 将请求配置转换为 Axios 配置
   * 
   * @param requestConfig - 请求配置
   * @param originalConfig - 原始 Axios 配置
   * @returns Axios 配置
   */
  private requestConfigToAxiosConfig(
    requestConfig: RequestConfig,
    originalConfig: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig {
    return {
      ...originalConfig,
      headers: originalConfig.headers,
      params: requestConfig.params,
      data: requestConfig.data,
      timeout: requestConfig.timeout,
      signal: requestConfig.signal,
      withCredentials: requestConfig.withCredentials,
      responseType: requestConfig.responseType,
    };
  }

  /**
   * 将 Axios 响应转换为 API 响应
   * 
   * 将后端返回的原始数据包装成标准的 ApiResponse 格式
   * 
   * @param response - Axios 响应
   * @returns API 响应
   */
  private axiosResponseToApiResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as unknown as Record<string, string>,
      config: this.axiosConfigToRequestConfig(response.config),
    };
  }

  /**
   * 将 API 响应转换为 Axios 响应
   * 
   * @param apiResponse - API 响应
   * @param originalResponse - 原始 Axios 响应
   * @returns Axios 响应
   */
  private apiResponseToAxiosResponse<T>(
    apiResponse: ApiResponse<T>,
    originalResponse: AxiosResponse<T>
  ): AxiosResponse<T> {
    return {
      ...originalResponse,
      data: apiResponse.data,
      status: apiResponse.status,
      statusText: apiResponse.statusText,
    };
  }

  /**
   * 标准化错误对象
   * 
   * 将 Axios 错误或普通错误转换为 SDKError 格式
   * 
   * @param error - 原始错误对象
   * @returns 标准化的 SDK 错误
   */
  private normalizeError(error: AxiosError | Error): SDKError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        message: axiosError.message,
        code: axiosError.code,
        status: axiosError.response?.status,
        response: axiosError.response
          ? this.axiosResponseToApiResponse(axiosError.response)
          : undefined,
        isNetworkError: axiosError.code === "ERR_NETWORK",
        isTimeout: axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT",
        originalError: error,
      };
    }

    return {
      message: error.message,
      isNetworkError: false,
      isTimeout: false,
      originalError: error,
    };
  }

  /**
   * 添加请求拦截器
   * 
   * @param interceptor - 请求拦截器函数
   * @returns 移除拦截器的函数
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    return this.interceptorManager.addRequestInterceptor(interceptor);
  }

  /**
   * 添加响应拦截器
   * 
   * @param interceptor - 响应拦截器函数
   * @returns 移除拦截器的函数
   */
  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): () => void {
    return this.interceptorManager.addResponseInterceptor(interceptor);
  }

  /**
   * 添加错误拦截器
   * 
   * @param interceptor - 错误拦截器函数
   * @returns 移除拦截器的函数
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    return this.interceptorManager.addErrorInterceptor(interceptor);
  }

  /**
   * 发送 HTTP 请求
   * 
   * 核心请求方法，支持缓存、去重、重试等功能
   * 
   * @template T - 响应数据类型
   * @template D - 请求数据类型
   * @param url - 请求 URL
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>> - API 响应
   * 
   * @example
   * ```typescript
   * const response = await client.request<User[]>('/users', {
   *   method: 'GET',
   *   cache: { enabled: true, ttl: 60000 },
   *   deduplicate: true
   * });
   * ```
   */
  async request<T = unknown, D = unknown>(
    url: string, 
    config?: RequestConfig<D>
  ): Promise<ApiResponse<T>> {
    // 生成请求键，用于去重和缓存
    const requestKey = this.requestManager.generateRequestKey(url, config);
    
    // 请求去重 - 如果启用且存在相同请求，则返回现有 Promise
    if (config?.deduplicate) {
      return this.requestManager.deduplicate(requestKey, () => 
        this.executeRequest<T>(url, config)
      );
    }

    return this.executeRequest<T>(url, config);
  }

  /**
   * 执行 HTTP 请求
   * 
   * 处理缓存、重试、指标收集等核心逻辑
   * 
   * @template T - 响应数据类型
   * @template D - 请求数据类型
   * @param url - 请求 URL
   * @param config - 请求配置
   * @returns Promise<ApiResponse<T>> - API 响应
   */
  private async executeRequest<T = unknown, D = unknown>(
    url: string, 
    config?: RequestConfig<D>
  ): Promise<ApiResponse<T>> {
    // 生成请求 ID 和取消控制器
    const requestId = this.requestManager.generateRequestId(url, config);
    const abortController = this.requestManager.createController(requestId);

    try {
      // 检查缓存
      const cacheKey = this.requestManager.generateCacheKey(url, config);
      const cacheConfig = config?.cache || this.config.cacheConfig;
      
      // 仅对 GET 请求启用缓存
      if (cacheConfig?.enabled && config?.method === 'GET') {
        if (this.cacheManager.isValid(cacheKey, cacheConfig)) {
          const cached = this.cacheManager.get<T>(cacheKey);
          if (cached) return cached;
        }
      }

      const response = await this.retryManager.executeWithRetry(
        () =>
          this.axiosInstance.request<T>({
            url,
            method: config?.method ?? "GET",
            headers: config?.headers,
            params: config?.params,
            data: config?.data,
            timeout: config?.timeout,
            signal: abortController.signal,
            withCredentials: config?.withCredentials,
            responseType: config?.responseType,
          }),
        this.config.retryConfig
      );

      const apiResponse = this.axiosResponseToApiResponse(response);
      
      // 验证响应数据
      this.validatorManager.validate(apiResponse);
      
      // 缓存响应 - 仅对 GET 请求缓存
      if (cacheConfig?.enabled && config?.method === 'GET') {
        this.cacheManager.set(cacheKey, apiResponse, cacheConfig);
      }

      return apiResponse;
    } finally {
      // 清理请求控制器
      this.requestManager.removeController(requestId);
    }
  }

  /**
   * 发送 GET 请求
   * 
   * @template T - 响应数据类型
   * @param url - 请求 URL
   * @param params - URL 参数
   * @param config - 请求配置（不包含 method、params、data）
   * @returns Promise<ApiResponse<T>> - API 响应
   * 
   * @example
   * ```typescript
   * const users = await client.get<User[]>('/users', { page: 1 }, {
   *   cache: { enabled: true },
   *   deduplicate: true
   * });
   * ```
   */
  async get<T = unknown>(
    url: string,
    params?: RequestConfig["params"],
    config?: Omit<RequestConfig, "method" | "params" | "data">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "GET", params });
  }

  /**
   * 发送 POST 请求
   * 
   * @template T - 响应数据类型
   * @template D - 请求数据类型
   * @param url - 请求 URL
   * @param data - 请求数据
   * @param config - 请求配置（不包含 method、data）
   * @returns Promise<ApiResponse<T>> - API 响应
   * 
   * @example
   * ```typescript
   * const newUser = await client.post<User, CreateUserRequest>('/users', {
   *   name: 'John',
   *   email: 'john@example.com'
   * }, {
   *   retryConfig: { maxRetries: 3 }
   * });
   * ```
   */
  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<RequestConfig<D>, "method" | "data">
  ): Promise<ApiResponse<T>> {
    return this.request<T, D>(url, { ...config, method: "POST", data });
  }

  /**
   * 发送 PUT 请求
   * 
   * @template T - 响应数据类型
   * @template D - 请求数据类型
   * @param url - 请求 URL
   * @param data - 请求数据
   * @param config - 请求配置（不包含 method、data）
   * @returns Promise<ApiResponse<T>> - API 响应
   */
  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<RequestConfig<D>, "method" | "data">
  ): Promise<ApiResponse<T>> {
    return this.request<T, D>(url, { ...config, method: "PUT", data });
  }

  /**
   * 发送 PATCH 请求
   * 
   * @template T - 响应数据类型
   * @template D - 请求数据类型
   * @param url - 请求 URL
   * @param data - 请求数据
   * @param config - 请求配置（不包含 method、data）
   * @returns Promise<ApiResponse<T>> - API 响应
   */
  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<RequestConfig<D>, "method" | "data">
  ): Promise<ApiResponse<T>> {
    return this.request<T, D>(url, { ...config, method: "PATCH", data });
  }

  /**
   * 发送 DELETE 请求
   * 
   * @template T - 响应数据类型
   * @param url - 请求 URL
   * @param config - 请求配置（不包含 method）
   * @returns Promise<ApiResponse<T>> - API 响应
   */
  async delete<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, "method">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }

  /**
   * 发送 HEAD 请求
   * 
   * @template T - 响应数据类型
   * @param url - 请求 URL
   * @param config - 请求配置（不包含 method、data）
   * @returns Promise<ApiResponse<T>> - API 响应
   */
  async head<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, "method" | "data">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "HEAD" });
  }

  /**
   * 发送 OPTIONS 请求
   * 
   * @template T - 响应数据类型
   * @param url - 请求 URL
   * @param config - 请求配置（不包含 method、data）
   * @returns Promise<ApiResponse<T>> - API 响应
   */
  async options<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, "method" | "data">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "OPTIONS" });
  }

  /**
   * 获取底层 Axios 实例
   * 
   * 用于高级用法，直接访问 Axios 功能
   * 
   * @returns AxiosInstance - Axios 实例
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * 设置默认请求头
   * 
   * @param key - 请求头名称
   * @param value - 请求头值
   */
  setHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  /**
   * 移除默认请求头
   * 
   * @param key - 请求头名称
   */
  removeHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }

  /**
   * 设置基础 URL
   * 
   * @param baseUrl - 基础 URL
   */
  setBaseUrl(baseUrl: string): void {
    this.axiosInstance.defaults.baseURL = baseUrl;
    this.config.baseUrl = baseUrl;
  }

  /**
   * 设置请求超时时间
   * 
   * @param timeout - 超时时间（毫秒）
   */
  setTimeout(timeout: number): void {
    this.axiosInstance.defaults.timeout = timeout;
    this.config.timeout = timeout;
  }

  /**
   * 设置指标收集器
   * 
   * 用于收集请求性能指标，如耗时、成功率等
   * 
   * @param collector - 指标收集器函数
   */
  setMetricsCollector(collector: (metrics: Metrics) => void): void {
    this.metricsCollector.setCollector(collector);
  }

  /**
   * 添加响应验证器
   * 
   * 用于验证响应数据的格式和内容
   * 
   * @template T - 响应数据类型
   * @param validator - 验证器函数
   */
  addResponseValidator<T>(validator: ResponseValidator<T>): void {
    this.validatorManager.addValidator(validator);
  }

  /**
   * 取消指定请求
   * 
   * @param requestId - 请求 ID
   */
  cancelRequest(requestId: string): void {
    this.requestManager.cancelRequest(requestId);
  }

  /**
   * 取消所有请求
   */
  cancelAllRequests(): void {
    this.requestManager.cancelAllRequests();
  }

  // ===== 缓存管理 =====
  
  /**
   * 清空所有缓存
   */
  clearCache(): void {
    this.cacheManager.clear();
  }

  /**
   * 获取缓存大小
   * 
   * @returns number - 缓存项数量
   */
  getCacheSize(): number {
    return this.cacheManager.size();
  }

  // ===== 拦截器管理 =====
  
  /**
   * 清空所有拦截器
   */
  clearInterceptors(): void {
    this.interceptorManager.clear();
  }

  /**
   * 获取各类拦截器数量
   * 
   * @returns object - 包含请求、响应、错误拦截器数量的对象
   */
  getInterceptorCounts(): {
    request: number;
    response: number;
    error: number;
  } {
    return {
      request: this.interceptorManager.getRequestInterceptorCount(),
      response: this.interceptorManager.getResponseInterceptorCount(),
      error: this.interceptorManager.getErrorInterceptorCount(),
    };
  }

  // ===== 验证器管理 =====
  
  /**
   * 清空所有验证器
   */
  clearValidators(): void {
    this.validatorManager.clear();
  }

  /**
   * 获取验证器数量
   * 
   * @returns number - 验证器数量
   */
  getValidatorCount(): number {
    return this.validatorManager.getValidatorCount();
  }
}

/**
 * 创建 HTTP 客户端实例
 * 
 * 这是推荐的创建 HttpClient 实例的方式
 * 
 * @param config - 客户端配置
 * @returns HttpClient - HTTP 客户端实例
 * 
 * @example
 * ```typescript
 * const client = createHttpClient({
 *   baseUrl: 'https://api.example.com',
 *   timeout: 10000,
 *   cacheConfig: { enabled: true, ttl: 60000 }
 * });
 * ```
 */
export function createHttpClient(config: HttpClientConfig): HttpClient {
  return new HttpClient(config);
}

/**
 * 获取 HTTP 客户端实例
 * 
 * createHttpClient 的别名，提供更语义化的方法名
 * 
 * @param config - 客户端配置
 * @returns HttpClient - HTTP 客户端实例
 */
export function getHttpClient(config: HttpClientConfig): HttpClient {
  return createHttpClient(config);
}

export type {
  SDKConfig,
  RequestConfig,
  ApiResponse,
  SDKError,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  RetryConfig,
  HttpMethod,
  ResponseType,
  CacheConfig,
  Metrics,
  ResponseValidator,
  InterceptorManager,
} from "./types";

export { DEFAULT_TIMEOUT, HTTP_STATUS } from "./constants";
