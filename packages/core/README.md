# @zhj-sdk/core

Core utilities and shared functionality for the SDK.

## Installation

```bash
npm install @zhj-sdk/core
# or
pnpm add @zhj-sdk/core
```

## Usage

```typescript
import { deepMerge, debounce, throttle, generateId } from "@zhj-sdk/core";
import type { SDKConfig, ApiResponse } from "@zhj-sdk/core";

// Deep merge objects
const merged = deepMerge({ a: 1 }, { b: 2 });

// Debounce a function
const debouncedFn = debounce(() => console.log("Called!"), 300);

// Generate unique ID
const id = generateId();
```

## API

### Utilities

- `deepMerge<T>(target, ...sources)` - Deep merge objects
- `debounce<T>(fn, delay)` - Create a debounced function
- `throttle<T>(fn, limit)` - Create a throttled function
- `sleep(ms)` - Promise-based delay
- `generateId()` - Generate a random ID
- `isObject(value)` - Check if value is an object

### Types

- `SDKConfig` - Base SDK configuration
- `RequestOptions` - HTTP request options
- `ApiResponse<T>` - API response wrapper
- `EventHandler<T>` - Event handler type

### Constants

- `DEFAULT_TIMEOUT` - Default request timeout (30000ms)
- `DEFAULT_BASE_URL` - Default base URL
- `HTTP_STATUS` - HTTP status codes
- `SDK_VERSION` - Current SDK version
