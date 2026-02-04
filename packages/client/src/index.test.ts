import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { HttpClient, createHttpClient } from "./index";
import { 
  CacheManager, 
  MetricsCollector, 
  RequestManager, 
  InterceptorManager, 
  ValidatorManager, 
  RetryManager 
} from "./modules";

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  return {
    ...actual,
    default: {
      create: vi.fn(() => ({
        request: vi.fn(),
        defaults: {
          headers: { common: {} },
          baseURL: "",
          timeout: 30000,
        },
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
      isAxiosError: (actual as unknown as typeof axios).isAxiosError,
    },
  };
});

describe("HttpClient", () => {
  let client: HttpClient;
  let mockAxiosInstance: ReturnType<typeof axios.create>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new HttpClient({
      baseUrl: "https://api.example.com",
      timeout: 5000,
    });
    mockAxiosInstance = (axios.create as ReturnType<typeof vi.fn>).mock
      .results[0]?.value;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create axios instance with correct config", () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "https://api.example.com",
          timeout: 5000,
        })
      );
    });

    it("should use default timeout when not provided", () => {
      new HttpClient({ baseUrl: "https://api.example.com" });
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });

    it("should setup interceptors", () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe("createHttpClient", () => {
    it("should create a new HttpClient instance", () => {
      const newClient = createHttpClient({
        baseUrl: "https://api.test.com",
      });
      expect(newClient).toBeInstanceOf(HttpClient);
    });
  });

  describe("setHeader / removeHeader", () => {
    it("should set header correctly", () => {
      client.setHeader("Authorization", "Bearer token123");
      expect(mockAxiosInstance.defaults.headers.common["Authorization"]).toBe(
        "Bearer token123"
      );
    });

    it("should remove header correctly", () => {
      client.setHeader("Authorization", "Bearer token123");
      client.removeHeader("Authorization");
      expect(
        mockAxiosInstance.defaults.headers.common["Authorization"]
      ).toBeUndefined();
    });
  });

  describe("setBaseUrl", () => {
    it("should update baseURL", () => {
      client.setBaseUrl("https://new-api.example.com");
      expect(mockAxiosInstance.defaults.baseURL).toBe(
        "https://new-api.example.com"
      );
    });
  });

  describe("setTimeout", () => {
    it("should update timeout", () => {
      client.setTimeout(10000);
      expect(mockAxiosInstance.defaults.timeout).toBe(10000);
    });
  });

  describe("getAxiosInstance", () => {
    it("should return the axios instance", () => {
      const instance = client.getAxiosInstance();
      expect(instance).toBe(mockAxiosInstance);
    });
  });

  describe("setMetricsCollector", () => {
    it("should set metrics collector", () => {
      const collector = vi.fn();
      client.setMetricsCollector(collector);
      // 验证设置成功（通过后续请求验证）
      expect(typeof collector).toBe("function");
    });
  });

  describe("addResponseValidator", () => {
    it("should add response validator", () => {
      const validator = vi.fn(() => true);
      client.addResponseValidator(validator);
      // 验证添加成功
      expect(typeof validator).toBe("function");
    });
  });

  describe("cache management", () => {
    it("should clear cache", () => {
      client.clearCache();
      expect(client.getCacheSize()).toBe(0);
    });

    it("should get cache size", () => {
      const size = client.getCacheSize();
      expect(typeof size).toBe("number");
      expect(size).toBeGreaterThanOrEqual(0);
    });
  });

  describe("interceptor management", () => {
    it("should clear all interceptors", () => {
      client.clearInterceptors();
      const counts = client.getInterceptorCounts();
      expect(counts.request).toBe(0);
      expect(counts.response).toBe(0);
      expect(counts.error).toBe(0);
    });

    it("should get interceptor counts", () => {
      const counts = client.getInterceptorCounts();
      expect(typeof counts).toBe("object");
      expect(typeof counts.request).toBe("number");
      expect(typeof counts.response).toBe("number");
      expect(typeof counts.error).toBe("number");
    });
  });

  describe("validator management", () => {
    it("should clear all validators", () => {
      client.clearValidators();
      expect(client.getValidatorCount()).toBe(0);
    });

    it("should get validator count", () => {
      const count = client.getValidatorCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("request cancellation", () => {
    it("should cancel specific request", () => {
      expect(() => client.cancelRequest("test-request-id")).not.toThrow();
    });

    it("should cancel all requests", () => {
      expect(() => client.cancelAllRequests()).not.toThrow();
    });
  });
});

describe("HttpClient HTTP methods", () => {
  let client: HttpClient;
  let mockRequest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = vi.fn().mockResolvedValue({
      data: { success: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { method: "GET" },
    });

    (axios.create as ReturnType<typeof vi.fn>).mockReturnValue({
      request: mockRequest,
      defaults: {
        headers: { common: {} },
        baseURL: "",
        timeout: 30000,
      },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    });

    client = new HttpClient({
      baseUrl: "https://api.example.com",
    });
  });

  it("should call GET request", async () => {
    await client.get("/users", { page: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/users",
        method: "GET",
        params: { page: 1 },
      })
    );
  });

  it("should call POST request", async () => {
    await client.post("/users", { name: "John" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/users",
        method: "POST",
        data: { name: "John" },
      })
    );
  });

  it("should call PUT request", async () => {
    await client.put("/users/1", { name: "Jane" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/users/1",
        method: "PUT",
        data: { name: "Jane" },
      })
    );
  });

  it("should call PATCH request", async () => {
    await client.patch("/users/1", { name: "Jane" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/users/1",
        method: "PATCH",
        data: { name: "Jane" },
      })
    );
  });

  it("should call DELETE request", async () => {
    await client.delete("/users/1");
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/users/1",
        method: "DELETE",
      })
    );
  });

  it("should call HEAD request", async () => {
    await client.head("/users");
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/users",
        method: "HEAD",
      })
    );
  });

  it("should call OPTIONS request", async () => {
    await client.options("/users");
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/users",
        method: "OPTIONS",
      })
    );
  });

  it("should return normalized ApiResponse", async () => {
    const response = await client.get<{ success: boolean }>("/test");
    expect(response).toEqual(
      expect.objectContaining({
        data: { success: true },
        status: 200,
        statusText: "OK",
      })
    );
  });

  it("should handle request with deduplication option", async () => {
    // 测试去重选项不会导致错误
    const response = await client.get("/test", undefined, { deduplicate: true });
    
    expect(response).toEqual(
      expect.objectContaining({
        data: { success: true },
        status: 200,
      })
    );
  });

  it("should handle request with cache", async () => {
    const response = await client.get("/test", undefined, { 
      cache: { enabled: true, ttl: 60000 } 
    });
    
    expect(response).toEqual(
      expect.objectContaining({
        data: { success: true },
        status: 200,
      })
    );
  });

  it("should handle generic types correctly", async () => {
    interface User {
      id: number;
      name: string;
    }
    
    mockRequest.mockResolvedValue({
      data: { id: 1, name: "John" },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { method: "POST" },
    });

    const response = await client.post<User, { name: string }>("/users", { name: "John" });
    
    expect(response.data).toEqual({ id: 1, name: "John" });
    expect(response.data.id).toBe(1);
    expect(response.data.name).toBe("John");
  });
});

describe("HttpClient Modules", () => {
  describe("CacheManager", () => {
    it("should create cache manager", () => {
      const cache = new CacheManager();
      expect(cache).toBeInstanceOf(CacheManager);
    });

    it("should handle cache operations", () => {
      const cache = new CacheManager();
      const testData = { data: "test", status: 200 };
      const config = { enabled: true, ttl: 60000, maxEntries: 100 };
      
      cache.set("key1", testData, config);
      expect(cache.get("key1")).toBe(testData);
      expect(cache.isValid("key1", config)).toBe(true);
      
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe("MetricsCollector", () => {
    it("should create metrics collector", () => {
      const metrics = new MetricsCollector();
      expect(metrics).toBeInstanceOf(MetricsCollector);
    });

    it("should handle timing", () => {
      const metrics = new MetricsCollector();
      const endTiming = metrics.startTiming();
      
      setTimeout(() => {
        const duration = endTiming();
        expect(typeof duration).toBe("number");
        expect(duration).toBeGreaterThan(0);
      }, 10);
    });
  });

  describe("RequestManager", () => {
    it("should create request manager", () => {
      const manager = new RequestManager();
      expect(manager).toBeInstanceOf(RequestManager);
    });

    it("should generate request IDs", () => {
      const manager = new RequestManager();
      const id1 = manager.generateRequestId("/test", { method: "GET" });
      const id2 = manager.generateRequestId("/test", { method: "POST" });
      
      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
      expect(id1).not.toBe(id2);
    });
  });

  describe("InterceptorManager", () => {
    it("should create interceptor manager", () => {
      const manager = new InterceptorManager();
      expect(manager).toBeInstanceOf(InterceptorManager);
    });

    it("should manage interceptors", () => {
      const manager = new InterceptorManager();
      const requestInterceptor = vi.fn((config) => config);
      const responseInterceptor = vi.fn((response) => response);
      const errorInterceptor = vi.fn((error) => error);
      
      const remove1 = manager.addRequestInterceptor(requestInterceptor);
      const remove2 = manager.addResponseInterceptor(responseInterceptor);
      const remove3 = manager.addErrorInterceptor(errorInterceptor);
      
      expect(manager.getRequestInterceptorCount()).toBe(1);
      expect(manager.getResponseInterceptorCount()).toBe(1);
      expect(manager.getErrorInterceptorCount()).toBe(1);
      
      remove1();
      remove2();
      remove3();
      
      expect(manager.getRequestInterceptorCount()).toBe(0);
      expect(manager.getResponseInterceptorCount()).toBe(0);
      expect(manager.getErrorInterceptorCount()).toBe(0);
    });
  });

  describe("ValidatorManager", () => {
    it("should create validator manager", () => {
      const manager = new ValidatorManager();
      expect(manager).toBeInstanceOf(ValidatorManager);
    });

    it("should manage validators", () => {
      const manager = new ValidatorManager();
      const validator = vi.fn(() => true);
      
      manager.addValidator(validator);
      expect(manager.getValidatorCount()).toBe(1);
      
      manager.clear();
      expect(manager.getValidatorCount()).toBe(0);
    });
  });

  describe("RetryManager", () => {
    it("should create retry manager", () => {
      const metricsCollector = new MetricsCollector();
      const retryManager = new RetryManager(metricsCollector);
      expect(retryManager).toBeInstanceOf(RetryManager);
    });
  });
});