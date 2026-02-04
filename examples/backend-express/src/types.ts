export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  success: boolean;
  timestamp: string;
}
