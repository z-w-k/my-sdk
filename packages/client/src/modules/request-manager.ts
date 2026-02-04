import { ApiResponse, RequestConfig } from "../types";

export class RequestManager {
  private abortControllers: Map<string, AbortController> = new Map();
  private pendingRequests: Map<string, Promise<ApiResponse<any>>> = new Map();

  createController(requestId: string): AbortController {
    // 取消之前的相同请求
    this.cancelRequest(requestId);
    
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);
    return controller;
  }

  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  removeController(requestId: string): void {
    this.abortControllers.delete(requestId);
  }

  // 请求去重
  async deduplicate<T>(
    requestKey: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey) as Promise<T>;
    }

    const requestPromise = (async () => {
      try {
        return await requestFn();
      } finally {
        this.pendingRequests.delete(requestKey);
      }
    })();

    this.pendingRequests.set(requestKey, requestPromise as Promise<ApiResponse<any>>);
    return requestPromise;
  }

  generateRequestId(url: string, config?: RequestConfig): string {
    return `${url}_${config?.method || 'GET'}_${JSON.stringify(config?.params || {})}`;
  }

  generateRequestKey(url: string, config?: RequestConfig): string {
    return `${url}_${config?.method || 'GET'}_${JSON.stringify(config?.params || {})}_${JSON.stringify(config?.data || {})}`;
  }

  generateCacheKey(url: string, config?: RequestConfig): string {
    return `${url}_${JSON.stringify(config?.params || {})}`;
  }
}
