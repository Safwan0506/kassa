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

/* ── Category ── */

export interface Category {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

/* ── Supplier ── */

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

/* ── Product ── */

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  tvaRate: number;
  alertThreshold: number;
  photoUrl: string | null;
  isActive: boolean;
  categoryId: string | null;
  categoryName: string | null;
  supplierId: string | null;
  supplierName: string | null;
  organizationId: string;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  unit?: string;
  buyPrice: number;
  sellPrice: number;
  tvaRate?: number;
  alertThreshold?: number;
  photoUrl?: string;
  isActive?: boolean;
  categoryId?: string;
  supplierId?: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

/* ── Stock ── */

export type MovementType = 'ENTRY' | 'EXIT' | 'TRANSFER' | 'ADJUSTMENT';

export interface StockLevel {
  productId: string;
  productName: string;
  sku: string;
  categoryName: string | null;
  quantity: number;
  alertThreshold: number;
  unit: string;
}

export interface StockMovement {
  id: string;
  type: MovementType;
  quantity: number;
  reason: string | null;
  productId: string;
  productName: string;
  shopId: string;
  shopName: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface CreateMovementDto {
  productId: string;
  shopId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
}

export interface CreateTransferDto {
  productId: string;
  fromShopId: string;
  toShopId: string;
  quantity: number;
  reason?: string;
}

export interface StockTransfer {
  id: string;
  productId: string;
  productName: string;
  fromShopId: string;
  fromShopName: string;
  toShopId: string;
  toShopName: string;
  quantity: number;
  reason: string | null;
  userId: string;
  userName: string;
  createdAt: string;
}

/* ── Dashboard ── */

export interface DashboardStats {
  totalProducts: number;
  outOfStock: number;
  stockValue: number;
  todayMovements: number;
}

export interface StockAlert {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  alertThreshold: number;
  shopId: string;
  shopName: string;
}

/* ── API namespaces ── */

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

export const categoriesApi = {
  list() {
    return request<Category[]>('/api/categories');
  },

  create(dto: CreateCategoryDto) {
    return request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  update(id: string, dto: UpdateCategoryDto) {
    return request<Category>(`/api/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  delete(id: string) {
    return request<void>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

export const suppliersApi = {
  list() {
    return request<Supplier[]>('/api/suppliers');
  },

  create(dto: CreateSupplierDto) {
    return request<Supplier>('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  update(id: string, dto: UpdateSupplierDto) {
    return request<Supplier>(`/api/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  delete(id: string) {
    return request<void>(`/api/suppliers/${id}`, {
      method: 'DELETE',
    });
  },
};

export const productsApi = {
  list(filters: ProductFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.isActive !== undefined)
      params.set('isActive', String(filters.isActive));
    const qs = params.toString();
    return request<PaginatedResponse<Product>>(
      `/api/products${qs ? `?${qs}` : ''}`,
    );
  },

  getById(id: string) {
    return request<Product>(`/api/products/${id}`);
  },

  create(dto: CreateProductDto) {
    return request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  update(id: string, dto: UpdateProductDto) {
    return request<Product>(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  delete(id: string) {
    return request<void>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },

  search(query: string) {
    return request<Product[]>(
      `/api/products/search?q=${encodeURIComponent(query)}`,
    );
  },
};

export const stockApi = {
  getLevels(shopId: string) {
    return request<StockLevel[]>(`/api/stock/levels/${shopId}`);
  },

  getMovements(shopId: string, params?: { type?: MovementType; from?: string; to?: string }) {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const queryStr = qs.toString();
    return request<StockMovement[]>(
      `/api/stock/movements/${shopId}${queryStr ? `?${queryStr}` : ''}`,
    );
  },

  createMovement(dto: CreateMovementDto) {
    return request<StockMovement>('/api/stock/movements', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  createTransfer(dto: CreateTransferDto) {
    return request<StockTransfer>('/api/stock/transfers', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getTransfers(shopId: string) {
    return request<StockTransfer[]>(`/api/stock/transfers/${shopId}`);
  },
};

export const dashboardApi = {
  getStats(shopId: string) {
    return request<DashboardStats>(`/api/dashboard/stats/${shopId}`);
  },

  getAlerts(shopId: string) {
    return request<StockAlert[]>(`/api/dashboard/alerts/${shopId}`);
  },

  getRecentMovements(shopId: string) {
    return request<StockMovement[]>(
      `/api/dashboard/recent-movements/${shopId}`,
    );
  },
};
