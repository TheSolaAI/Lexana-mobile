import { ApiResponse, ApiError, ApiErrorDetail } from '@/types/api';

type ServiceType = 'data' | 'wallet' | 'goatIndex';

interface ApiClientOptions {
  authToken?: string | null;
  enableLogging?: boolean;
}

export class ApiClient {
  private authToken: string | null;
  private enableLogging: boolean;
  private dataServiceUrl: string;
  private walletServiceUrl: string;
  private goatIndexServiceUrl: string;

  constructor(options: ApiClientOptions = {}) {
    this.authToken = options.authToken || null;
    this.enableLogging = options.enableLogging ?? true;

    // Use environment variables or fallback URLs
    this.dataServiceUrl =
      process.env.EXPO_PUBLIC_DATA_SERVICE_URL || 'https://data-stream-service.solaai.tech';
    this.walletServiceUrl =
      process.env.EXPO_PUBLIC_WALLET_SERVICE_URL || 'https://wallet-service.solaai.tech';
    this.goatIndexServiceUrl = 'https://loadbalance.goatindex.ai';

    if (!this.dataServiceUrl) {
      throw new Error('DATA_SERVICE_URL environment variable is not defined');
    }
  }

  /**
   * Helper method to create request headers
   */
  private createHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Helper method to create full URL based on service type
   */
  private createUrl(endpoint: string, service: ServiceType = 'data'): string {
    let baseUrl: string;

    switch (service) {
      case 'data':
        baseUrl = this.dataServiceUrl;
        break;
      case 'wallet':
        baseUrl = this.walletServiceUrl;
        break;
      case 'goatIndex':
        baseUrl = this.goatIndexServiceUrl;
        break;
      default:
        baseUrl = this.dataServiceUrl;
    }

    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${cleanBaseUrl}${cleanEndpoint}`;
  }

  /**
   * Helper method to handle fetch responses
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T> | ApiError> {
    try {
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));

        if (this.enableLogging) {
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            errorData,
          });
        }

        // Transform error response to match expected format
        const errors: ApiErrorDetail[] = errorData.errors || [
          {
            code: response.status.toString(),
            detail: errorData.message || response.statusText || 'Unknown error',
            attr: null,
          },
        ];

        return {
          success: false,
          type: 'api_error',
          errors,
          statusCode: response.status,
        };
      }
    } catch (error) {
      if (this.enableLogging) {
        console.error('API Client Error:', error);
      }

      return {
        success: false,
        type: 'network_error',
        errors: [
          {
            code: 'network',
            detail: error instanceof Error ? error.message : 'Network error',
            attr: null,
          },
        ],
      };
    }
  }

  /**
   * GET request method
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    service: ServiceType = 'data'
  ): Promise<ApiResponse<T> | ApiError> {
    try {
      let url = this.createUrl(endpoint, service);

      // Add query parameters if provided
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });

        if (searchParams.toString()) {
          url += `?${searchParams.toString()}`;
        }
      }

      if (this.enableLogging) {
        console.log('API GET Request:', { url, params, service });
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.createHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (this.enableLogging) {
        console.error('API GET Error:', error);
      }

      return {
        success: false,
        type: 'network_error',
        errors: [
          {
            code: 'network',
            detail: error instanceof Error ? error.message : 'Network error',
            attr: null,
          },
        ],
      };
    }
  }

  /**
   * POST request method
   */
  async post<T>(
    endpoint: string,
    data: unknown,
    service: ServiceType = 'data'
  ): Promise<ApiResponse<T> | ApiError> {
    try {
      const url = this.createUrl(endpoint, service);

      if (this.enableLogging) {
        console.log('API POST Request:', { url, data, service });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify(data),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (this.enableLogging) {
        console.error('API POST Error:', error);
      }

      return {
        success: false,
        type: 'network_error',
        errors: [
          {
            code: 'network',
            detail: error instanceof Error ? error.message : 'Network error',
            attr: null,
          },
        ],
      };
    }
  }

  // Type checker functions
  static isApiResponse<T>(response: unknown): response is ApiResponse<T> {
    return (
      response && typeof response === 'object' && (response as ApiResponse<T>).success === true
    );
  }

  static isApiError(response: unknown): response is ApiError {
    return (
      response &&
      typeof response === 'object' &&
      (response as ApiError).success === false &&
      Array.isArray((response as ApiError).errors)
    );
  }

  /**
   * Enable or disable logging
   */
  setLogging(enabled: boolean): void {
    this.enableLogging = enabled;
  }

  /**
   * Update auth token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }
}

// Factory function to create an API client with a specific token
export function createApiClient(authToken: string | null, enableLogging = true) {
  return new ApiClient({
    authToken,
    enableLogging,
  });
}

// Default export for easy importing
export default ApiClient;
