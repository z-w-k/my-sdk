import { ApiResponse, CacheConfig } from "../types";

export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  get<T>(key: string): ApiResponse<T> | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    return cached.data;
  }

  set(key: string, data: any, config: CacheConfig): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // 清理过期缓存
    if (this.cache.size > (config.maxEntries || 100)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  isValid(key: string, config: CacheConfig): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < (config.ttl || 60000);
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  size(): number {
    return this.cache.size;
  }
}
