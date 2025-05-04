import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'sonner-native';
import { ApiError, ApiErrorDetail, ApiResponse } from '@/types/api';
import { createPrivyClient, getAccessToken } from '@privy-io/expo';

interface ApiClientOptions {
  authToken?: string | null;
  enableLogging?: boolean;
}

export const privyClient = createPrivyClient({
  appId: process.env.EXPO_PUBLIC_PRIVY_APP_ID!,
  clientId: process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID,
});

export class ApiClient {
  private authClient: AxiosInstance;
  private options: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    const authServiceUrl = process.env.EXPO_PUBLIC_AUTH_SERVICE_URL;

    if (!authServiceUrl) {
      throw new Error('AUTH_SERVICE_URL environment variable is not defined');
    }

    this.options = {
      ...options,
      enableLogging: options.enableLogging ?? true,
    };

    // Create Axios instance for auth service
    this.authClient = this.createClient(authServiceUrl, options.authToken);
  }

  /**
   * Creates an Axios client with common configuration, the auth header interceptor,
   * and axios-retry settings.
   */
  private createClient(baseURL: string, authToken?: string | null): AxiosInstance {
    const client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    client.interceptors.request.use(
      async config => {
        const token = authToken || (await getAccessToken());
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Add request logging interceptors if enabled
    if (this.options.enableLogging) {
      // Request interceptor for logging
      client.interceptors.request.use(
        config => {
          console.log(`Request:`, {
            method: config.method?.toUpperCase(),
            url: `${config.baseURL}${config.url}`,
            params: config.params,
            data: this.truncateData(config.data),
          });

          return config;
        },
        error => {
          console.error('Request Error:', error);
          return Promise.reject(error);
        }
      );

      // Response interceptor for logging
      client.interceptors.response.use(
        response => {
          console.log(`Response: ${response.status}`, {
            status: response.status,
            statusText: response.statusText,
            data: this.truncateData(response.data),
          });

          return response;
        },
        error => {
          console.error(`Response Error: ${error.response?.status || 'Network Error'}`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response ? this.truncateData(error.response.data) : {},
            message: error.message,
          });

          return Promise.reject(error);
        }
      );
    }

    // Retry on network errors or server errors (>=500)
    axiosRetry(client, {
      retries: 3,
      retryDelay: retryCount => {
        const delay = axiosRetry.exponentialDelay(retryCount);
        console.log(`Retrying request... Attempt ${retryCount}, waiting ${delay}ms`);
        return delay;
      },
      retryCondition: error => {
        if (error.code === 'ECONNABORTED' || axiosRetry.isNetworkError(error)) {
          return true;
        }
        return !!(error.response && error.response.status >= 500);
      },
    });

    return client;
  }

  /**
   * Helper method for logging
   */
  private truncateData(data: any): any {
    if (!data) return data;

    try {
      const stringified = JSON.stringify(data);
      if (stringified.length > 500) {
        return JSON.parse(stringified.substring(0, 500) + '... [truncated]');
      }
      return data;
    } catch (e: any) {
      return '[Unserializable data] ' + e.message;
    }
  }

  /**
   * Returns the auth client.
   */
  private getClient(): AxiosInstance {
    return this.authClient;
  }

  /**
   * A helper to check if the error indicates that the token has expired.
   */
  private isTokenExpiredError(error: AxiosError): boolean {
    if (error.response && error.response.data) {
      const data = error.response.data as any;
      if (data.error && data.error === 'Invalid or expired token') return true;
      if (data.detail && data.detail === 'Token has expired') return true;
      // For auth service errors
      if (data.errors && Array.isArray(data.errors)) {
        const firstError = data.errors[0];
        if (
          firstError.detail === 'Token has expired' ||
          firstError.code === 'Invalid or expired token'
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Generic request handler that:
   *  - Executes the provided request function.
   *  - Handles token-related logic
   */
  private async request<T>(
    requestFn: () => Promise<AxiosResponse<T>>
  ): Promise<ApiResponse<T> | ApiError> {
    let retryAttempted = false;
    while (true) {
      try {
        const response = await requestFn();
        return this.handleResponse(response);
      } catch (err) {
        const error = err as AxiosError;

        if (!retryAttempted && this.isTokenExpiredError(error)) {
          retryAttempted = true;
          const updatedToken = await getAccessToken();

          // Retry with new token if refresh was successful
          if (updatedToken) {
            continue;
          }
        }

        return this.handleError(error);
      }
    }
  }

  private handleResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return { success: true, data: response.data };
  }

  /**
   * Handles errors for auth service.
   */
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const { status, data } = error.response;

      if (data && typeof data === 'object' && 'type' in data && 'errors' in data) {
        const apiError: ApiError = {
          success: false,
          type: data.type as string,
          errors: data.errors as ApiErrorDetail[],
          statusCode: status,
        };

        if (status >= 500) {
          toast.error(apiError.errors.map(e => e.detail).join('\n'));
        }
        return apiError;
      }
      return {
        success: false,
        type: 'unknown_error',
        errors: [
          {
            code: 'unknown',
            detail: 'An unexpected error occurred.',
            attr: null,
          },
        ],
        statusCode: status,
      };
    }

    // No response (network error)
    return {
      success: false,
      type: 'network_error',
      errors: [
        {
          code: 'network',
          detail: error.message || 'Network error',
          attr: null,
        },
      ],
    };
  }

  // Request methods
  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient();
    return this.request<T>(() => client.get<T>(url, { params }));
  }

  async post<T>(url: string, data: any): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient();
    return this.request<T>(() => client.post<T>(url, data));
  }

  async put<T>(url: string, data: any): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient();
    return this.request<T>(() => client.put<T>(url, data));
  }

  async patch<T>(url: string, data: any): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient();
    return this.request<T>(() => client.patch<T>(url, data));
  }

  async delete<T>(url: string): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient();
    return this.request<T>(() => client.delete<T>(url));
  }

  // Type checker functions
  static isApiResponse<T>(response: any): response is ApiResponse<T> {
    return response && response.success === true;
  }

  static isApiError(response: any): response is ApiError {
    return response && response.success === false && Array.isArray(response.errors);
  }

  /**
   * Enable or disable logging
   */
  setLogging(enabled: boolean): void {
    this.options.enableLogging = enabled;
  }
}

export const apiClient = new ApiClient();
