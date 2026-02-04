import { ApiResponse, ResponseValidator, SDKError } from "../types";

export class ValidatorManager {
  private validators: ResponseValidator[] = [];

  addValidator<T>(validator: ResponseValidator<T>): void {
    this.validators.push(validator as ResponseValidator);
  }

  removeValidator<T>(validator: ResponseValidator<T>): void {
    const index = this.validators.indexOf(validator as ResponseValidator);
    if (index > -1) {
      this.validators.splice(index, 1);
    }
  }

  validate<T>(response: ApiResponse<T>): void {
    for (const validator of this.validators) {
      if (!validator(response.data)) {
        const error: SDKError = {
          message: 'Response validation failed',
          status: response.status,
          isNetworkError: false,
          isTimeout: false,
        };
        throw error;
      }
    }
  }

  clear(): void {
    this.validators = [];
  }

  getValidatorCount(): number {
    return this.validators.length;
  }
}
