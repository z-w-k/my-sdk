# @my-sdk/client

HTTP client for API interactions.

## Installation

```bash
npm install @my-sdk/client
# or
pnpm add @my-sdk/client
```

## Usage

```typescript
import { HttpClient } from "@my-sdk/client";

const client = new HttpClient({
  baseUrl: "https://api.example.com",
  timeout: 5000,
  headers: {
    Authorization: "Bearer token",
  },
});

// GET request
const { data, status } = await client.get<User>("/users/1");

// POST request
const response = await client.post<User>("/users", {
  name: "John",
  email: "john@example.com",
});

// PUT request
await client.put("/users/1", { name: "Jane" });

// DELETE request
await client.delete("/users/1");

// PATCH request
await client.patch("/users/1", { name: "Updated" });
```

## Configuration

```typescript
interface HttpClientConfig {
  baseUrl: string;      // API base URL
  timeout?: number;     // Request timeout in ms (default: 30000)
  headers?: Record<string, string>;  // Default headers
  retries?: number;     // Number of retries (default: 3)
  retryDelay?: number;  // Delay between retries in ms (default: 1000)
}
```
