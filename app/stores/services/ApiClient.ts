import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'sonner-native';
import { ApiError, ApiErrorDetail, ApiResponse } from '@/types/api';
import { createPrivyClient } from '@privy-io/expo';

interface ApiClientOptions {
  authToken?: string | null;
  enableLogging?: boolean;
  timeout?: number;
}

// Constants
const DEFAULT_TIMEOUT = 10000;
const DEV_TIMEOUT = 60000;
const AUTH_SERVICE_URL = process.env.EXPO_PUBLIC_AUTH_SERVICE_URL;
const MAIN_SERVICE_URL = process.env.EXPO_PUBLIC_MAIN_SERVICE_URL;
const MOBILE_CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID;
const MOBILE_API_KEY = process.env.EXPO_PUBLIC_ANDROID_MOBILE_API_KEY;
const LOG_TRUNCATE_LENGTH = 500;
const MAX_RETRIES = 3;

export const privyClient = createPrivyClient({
  appId: process.env.EXPO_PUBLIC_PRIVY_APP_ID!,
  clientId: process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID,
});

export class ApiClient {
  private authClient: AxiosInstance;
  private mainClient: AxiosInstance;
  private options: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    if (!AUTH_SERVICE_URL || !MAIN_SERVICE_URL) {
      throw new Error('Service URLs are not defined');
    }

    this.options = {
      ...options,
      enableLogging: options.enableLogging ?? true,
      timeout: this.determineTimeout(options.timeout),
    };

    this.authClient = this.createClient(AUTH_SERVICE_URL, options.authToken);
    this.mainClient = this.createClient(MAIN_SERVICE_URL, options.authToken);
    this.configureMainClientHeaders();
  }

  /**
   * Determines the appropriate timeout based on environment and options
   */
  private determineTimeout(customTimeout?: number): number {
    if (customTimeout) return customTimeout;

    return __DEV__ ? DEV_TIMEOUT : DEFAULT_TIMEOUT;
  }

  /**
   * Configures custom headers for the main client
   */
  private configureMainClientHeaders(): void {
    this.mainClient.interceptors.request.use(
      config => {
        config.headers = config.headers || {};
        config.headers['x-mobile-client-id'] = MOBILE_CLIENT_ID;
        config.headers['x-mobile-api-key'] = MOBILE_API_KEY;
        return config;
      },
      error => Promise.reject(error)
    );
  }

  /**
   * Creates an Axios client with common configuration, the auth header interceptor,
   * and axios-retry settings.
   */
  private createClient(baseURL: string, authToken?: string | null): AxiosInstance {
    const client = axios.create({
      baseURL,
      timeout: this.options.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.addAuthInterceptor(client, authToken);

    if (this.options.enableLogging) {
      this.addLoggingInterceptors(client);
    }

    this.configureRetryStrategy(client);

    return client;
  }

  /**
   * Adds authentication token interceptor to client
   */
  private addAuthInterceptor(client: AxiosInstance, authToken?: string | null): void {
    client.interceptors.request.use(
      async config => {
        const token = authToken || (await privyClient.getAccessToken());
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
  }

  /**
   * Adds logging interceptors for debugging with pretty printing and emojis
   */
  private addLoggingInterceptors(client: AxiosInstance): void {
    // Request logging
    client.interceptors.request.use(
      config => {
        const methodEmoji = this.getMethodEmoji(config.method);
        const endpoint = `${config.baseURL}${config.url}`;

        console.log(`\n🚀 ${methodEmoji} Request: ${config.method?.toUpperCase()} ${endpoint}`);

        if (config.params && Object.keys(config.params).length > 0) {
          console.log(`📝 Params:`, JSON.stringify(config.params, null, 2));
        }

        if (config.data) {
          console.log(`📦 Data:`, JSON.stringify(this.truncateData(config.data), null, 2));
        }

        return config;
      },
      error => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response logging
    client.interceptors.response.use(
      response => {
        const statusEmoji = this.getStatusEmoji(response.status);

        console.log(`\n${statusEmoji} Response: ${response.status} ${response.statusText}`);

        if (response.data) {
          console.log(`📄 Data:`, JSON.stringify(this.truncateData(response.data), null, 2));
        }

        return response;
      },
      error => {
        const status = error.response?.status || 'Network Error';
        const statusEmoji = this.getStatusEmoji(status);

        console.error(`\n${statusEmoji} Response Error: ${status}`);

        if (error.response?.statusText) {
          console.error(`📝 Status Text: ${error.response.statusText}`);
        }

        if (error.response?.data) {
          console.error(
            `📄 Error Data:`,
            JSON.stringify(this.truncateData(error.response.data), null, 2)
          );
        }

        if (error.message) {
          console.error(`💬 Message: ${error.message}`);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Returns appropriate emoji for HTTP method
   */
  private getMethodEmoji(method?: string): string {
    switch (method?.toLowerCase()) {
      case 'get':
        return '📥';
      case 'post':
        return '📤';
      case 'put':
        return '🔄';
      case 'patch':
        return '🩹';
      case 'delete':
        return '🗑️';
      default:
        return '🔍';
    }
  }

  /**
   * Returns appropriate emoji for HTTP status code
   */
  private getStatusEmoji(status: number | string): string {
    if (status === 'Network Error') return '🌐❌';

    if (typeof status === 'number') {
      if (status < 300) return '✅';
      if (status < 400) return '↪️';
      if (status < 500) return '⚠️';
      return '❌';
    }

    return '❓';
  }

  /**
   * Configures retry strategy
   */
  private configureRetryStrategy(client: AxiosInstance): void {
    axiosRetry(client, {
      retries: MAX_RETRIES,
      retryDelay: retryCount => {
        const delay = axiosRetry.exponentialDelay(retryCount);
        console.log(
          `🔄 Retrying request... Attempt ${retryCount}/#{MAX_RETRIES}, waiting ${delay}ms ⏱️`
        );
        return delay;
      },
      retryCondition: error => {
        // Retry on network errors or server errors (>=500)
        if (error.code === 'ECONNABORTED') {
          console.log('⏱️ Request timeout detected. Will retry.');
          return true;
        }

        if (axiosRetry.isNetworkError(error)) {
          console.log('🌐❌ Network error detected. Will retry.');
          return true;
        }

        if (error.response && error.response.status >= 500) {
          console.log(`🔥 Server error detected (${error.response.status}). Will retry.`);
          return true;
        }

        return false;
      },
    });
  }

  /**
   * Helper method for truncating data in logs
   */
  private truncateData(data: unknown): unknown {
    if (!data) return data;

    try {
      const stringified = JSON.stringify(data);
      if (stringified.length > LOG_TRUNCATE_LENGTH) {
        return JSON.parse(stringified.substring(0, LOG_TRUNCATE_LENGTH) + '... [truncated]');
      }
      return data;
    } catch (e: any) {
      return '[Unserializable data] ' + e.message;
    }
  }

  /**
   * Returns the appropriate client based on the service type.
   */
  private getClient(serviceType: 'auth' | 'main'): AxiosInstance {
    return serviceType === 'auth' ? this.authClient : this.mainClient;
  }

  /**
   * Checks if the error indicates that the token has expired.
   */
  private isTokenExpiredError(error: AxiosError): boolean {
    if (!error.response?.data) return false;

    const data = error.response.data as {
      error?: string;
      detail?: string;
      errors?: { detail?: string; code?: string }[];
    };

    // Check all possible error structures
    if (data.error === 'Invalid or expired token') return true;
    if (data.detail === 'Token has expired') return true;

    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.some(
        err => err.detail === 'Token has expired' || err.code === 'Invalid or expired token'
      );
    }

    return false;
  }

  /**
   * Generic request handler that handles token refresh and retries
   */
  private async request<T>(
    serviceType: 'auth' | 'main',
    requestFn: (client: AxiosInstance) => Promise<AxiosResponse<T>>
  ): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient(serviceType);
    let retryAttempted = false;

    while (true) {
      try {
        const response = await requestFn(client);
        return this.handleResponse(response);
      } catch (err) {
        const error = err as AxiosError;

        if (!retryAttempted && this.isTokenExpiredError(error)) {
          retryAttempted = true;
          const updatedToken = await privyClient.getAccessToken();

          // Retry with new token if refresh was successful
          if (updatedToken) {
            continue;
          }
        }

        return this.handleError(error);
      }
    }
  }

  /**
   * Processes successful API responses
   */
  private handleResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return { success: true, data: response.data };
  }

  /**
   * Processes API errors
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

    // Network error (no response)
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

  // Request methods with consistent implementation
  async get<T>(
    serviceType: 'auth' | 'main',
    url: string,
    params?: Record<string, unknown>,
    isMultipart: boolean = false
  ): Promise<ApiResponse<T> | ApiError> {
    return this.request(serviceType, client => {
      const config = isMultipart
        ? { params, headers: { 'Content-Type': 'multipart/form-data' } }
        : { params };
      return client.get<T>(url, config);
    });
  }

  async post<T>(
    serviceType: 'auth' | 'main',
    url: string,
    data: unknown,
    isMultipart: boolean = false
  ): Promise<ApiResponse<T> | ApiError> {
    return this.request(serviceType, client => {
      const config = isMultipart
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined;
      return client.post<T>(url, data, config);
    });
  }

  async put<T>(
    serviceType: 'auth' | 'main',
    url: string,
    data: unknown
  ): Promise<ApiResponse<T> | ApiError> {
    return this.request(serviceType, client => client.put<T>(url, data));
  }

  async patch<T>(
    serviceType: 'auth' | 'main',
    url: string,
    data: unknown
  ): Promise<ApiResponse<T> | ApiError> {
    return this.request(serviceType, client => client.patch<T>(url, data));
  }

  async delete<T>(serviceType: 'auth' | 'main', url: string): Promise<ApiResponse<T> | ApiError> {
    return this.request(serviceType, client => client.delete<T>(url));
  }

  // Type guard utility functions
  static isApiResponse<T>(response: unknown): response is ApiResponse<T> {
    return (
      typeof response === 'object' &&
      response !== null &&
      'success' in response &&
      (response as ApiResponse<T>).success === true
    );
  }

  static isApiError(response: unknown): response is ApiError {
    return (
      typeof response === 'object' &&
      response !== null &&
      'success' in response &&
      (response as ApiError).success === false &&
      Array.isArray((response as ApiError).errors)
    );
  }

  /**
   * Enable or disable logging
   */
  setLogging(enabled: boolean): void {
    this.options.enableLogging = enabled;
  }

  /**
   * Update timeout for all clients
   */
  setTimeout(timeout: number): void {
    this.options.timeout = timeout;
    this.authClient.defaults.timeout = timeout;
    this.mainClient.defaults.timeout = timeout;
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
