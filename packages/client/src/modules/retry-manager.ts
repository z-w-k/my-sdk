import { AxiosResponse } from "axios";
import { sleep } from "@zhj-sdk/utils";
import { RetryConfig, SDKError } from "../types";
import { MetricsCollector } from "./metrics";

export class RetryManager {
  constructor(private metricsCollector: MetricsCollector) {}

  async executeWithRetry<T>(
    fn: () => Promise<AxiosResponse<T>>,
    retryConfig?: RetryConfig
  ): Promise<AxiosResponse<T>> {
    const config: Required<RetryConfig> = {
      maxRetries: retryConfig?.maxRetries ?? 0,
      retryDelay: retryConfig?.retryDelay ?? 1000,
      retryCondition:
        retryConfig?.retryCondition ??
        ((error) => error.isNetworkError || error.isTimeout),
    };

    const endTiming = this.metricsCollector.startTiming();
    let retryCount = 0;
    let lastError: SDKError | undefined;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const response = await fn();
        const duration = endTiming();
        
        this.metricsCollector.collect({
          requestDuration: duration,
          success: true,
          statusCode: response.status,
          retryCount,
        });
        
        return response;
      } catch (error) {
        lastError = error as SDKError;
        retryCount = attempt;

        if (attempt < config.maxRetries && config.retryCondition(lastError)) {
          await sleep(config.retryDelay * Math.pow(2, attempt));
          continue;
        }

        const duration = endTiming();
        this.metricsCollector.collect({
          requestDuration: duration,
          success: false,
          statusCode: lastError.status,
          retryCount,
        });
        
        throw lastError;
      }
    }

    throw lastError;
  }
}
