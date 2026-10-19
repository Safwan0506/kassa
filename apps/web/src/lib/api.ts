export interface ApiError {
  status: number;
  message: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = 'Une erreur est survenue';
    try {
      const body = await response.json();
      message = body.message ?? body.error ?? message;
    } catch {
      // response body is not JSON
    }
    const error: ApiError = { status: response.status, message };
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/* ── Types matching the backend responses ── */

export interface ShopRole {
  shopId: string;
  shopName: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  shops: ShopRole[];
}

export interface LoginResponse {
  message: string;
  user: User;
}

export const authApi = {
  login(email: string, password: string) {
    return request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  refresh() {
    return request<void>('/api/auth/refresh', {
      method: 'POST',
    });
  },

  logout() {
    return request<void>('/api/auth/logout', {
      method: 'POST',
    });
  },

  getMe() {
    return request<User>('/api/auth/me');
  },
};
