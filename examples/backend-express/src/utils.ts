import { ApiResponse } from './types.js';

export function createApiResponse<T>(
  data: T,
  status: number = 200,
  statusText: string = 'OK'
): ApiResponse<T> {
  return {
    data,
    status,
    statusText,
    success: status >= 200 && status < 300,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  message: string,
  status: number = 500,
  statusText: string = 'Internal Server Error'
): ApiResponse<null> {
  return {
    data: null,
    status,
    statusText,
    success: false,
    timestamp: new Date().toISOString(),
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 模拟随机失败（用于测试重试机制）
export function shouldFail(rate: number = 0.1): boolean {
  return Math.random() < rate;
}
