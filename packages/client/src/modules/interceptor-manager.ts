import { 
  RequestInterceptor, 
  ResponseInterceptor, 
  ErrorInterceptor,
  RequestConfig,
  ApiResponse,
  SDKError 
} from "../types";

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  // Request Interceptors
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) this.requestInterceptors.splice(index, 1);
    };
  }

  async processRequest(config: RequestConfig): Promise<RequestConfig> {
    let modifiedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }

  // Response Interceptors
  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): () => void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor as ResponseInterceptor);
      if (index > -1) this.responseInterceptors.splice(index, 1);
    };
  }

  async processResponse<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse as ApiResponse<unknown>) as ApiResponse<T>;
    }
    return modifiedResponse;
  }

  // Error Interceptors
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) this.errorInterceptors.splice(index, 1);
    };
  }

  async processError(error: SDKError): Promise<SDKError> {
    let processedError = error;
    for (const interceptor of this.errorInterceptors) {
      try {
        processedError = await interceptor(processedError);
      } catch (interceptorError) {
        console.error('Error interceptor failed:', interceptorError);
      }
    }
    return processedError;
  }

  // Clear all interceptors
  clear(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  // Get counts
  getRequestInterceptorCount(): number {
    return this.requestInterceptors.length;
  }

  getResponseInterceptorCount(): number {
    return this.responseInterceptors.length;
  }

  getErrorInterceptorCount(): number {
    return this.errorInterceptors.length;
  }
}
