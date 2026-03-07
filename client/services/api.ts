import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config';

export interface ApiErrorPayload {
  message: string;
  details?: unknown;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
}

export class ApiError extends Error {
  public readonly status?: number;
  public readonly statusText?: string;
  public readonly data?: ApiErrorPayload;
  public readonly isNetworkError: boolean;

  constructor(params: {
    message: string;
    status?: number;
    statusText?: string;
    data?: ApiErrorPayload;
    isNetworkError?: boolean;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.statusText = params.statusText;
    this.data = params.data;
    this.isNetworkError = Boolean(params.isNetworkError);
  }
}

function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError: AxiosError<ApiErrorPayload> = error;
    const responseMessage = axiosError.response?.data?.message;
    return new ApiError({
      message: responseMessage || axiosError.message || 'API request failed',
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      isNetworkError: !axiosError.response,
    });
  }

  if (error instanceof Error) {
    return new ApiError({ message: error.message });
  }

  return new ApiError({ message: 'Unknown API error' });
}

class ApiClient {
  private readonly client: AxiosInstance;
  private readonly defaultRetryAttempts: number;
  private readonly defaultRetryDelay: number;

  constructor(baseURL: string, timeoutMs: number = 15000) {
    this.defaultRetryAttempts = 2;
    this.defaultRetryDelay = 500;
    this.client = axios.create({
      baseURL,
      timeout: timeoutMs,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: unknown) => Promise.reject(normalizeApiError(error))
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private shouldRetry(error: ApiError, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) {
      return false;
    }

    if (error.isNetworkError) {
      return true;
    }

    return Boolean(error.status && error.status >= 500);
  }

  private async requestWithRetry<T>(
    request: () => Promise<T>,
    config?: ApiRequestConfig,
    attempt: number = 1
  ): Promise<T> {
    const maxRetries = config?.retry ?? this.defaultRetryAttempts;
    const retryDelay = config?.retryDelay ?? this.defaultRetryDelay;

    try {
      return await request();
    } catch (error: unknown) {
      const normalizedError = normalizeApiError(error);
      if (this.shouldRetry(normalizedError, attempt, maxRetries)) {
        console.warn(
          `API retry ${attempt}/${maxRetries} for error: ${normalizedError.message}`
        );
        await this.delay(retryDelay * attempt);
        return this.requestWithRetry(request, config, attempt + 1);
      }

      console.error('API request failed:', normalizedError.message, {
        status: normalizedError.status,
      });
      throw normalizedError;
    }
  }

  async get<TResponse>(endpoint: string, config: ApiRequestConfig = {}): Promise<TResponse> {
    return this.requestWithRetry<TResponse>(
      async () => {
        const response = await this.client.get<TResponse>(endpoint, config);
        return response.data;
      },
      config
    );
  }

  async post<TResponse, TBody extends object>(
    endpoint: string,
    data: TBody,
    config: ApiRequestConfig = {}
  ): Promise<TResponse> {
    return this.requestWithRetry<TResponse>(
      async () => {
        const response = await this.client.post<TResponse>(endpoint, data, config);
        return response.data;
      },
      config
    );
  }

  async put<TResponse, TBody extends object>(
    endpoint: string,
    data: TBody,
    config: ApiRequestConfig = {}
  ): Promise<TResponse> {
    return this.requestWithRetry<TResponse>(
      async () => {
        const response = await this.client.put<TResponse>(endpoint, data, config);
        return response.data;
      },
      config
    );
  }

  async delete<TResponse>(endpoint: string, config: ApiRequestConfig = {}): Promise<TResponse> {
    return this.requestWithRetry<TResponse>(
      async () => {
        const response = await this.client.delete<TResponse>(endpoint, config);
        return response.data;
      },
      config
    );
  }
}

export const apiClient = new ApiClient(API_BASE_URL);