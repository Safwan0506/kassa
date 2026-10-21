export interface ApiError {
  status: number;
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
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

/* ── Customer ── */

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  organizationId: string;
  createdAt: string;
}

export interface CreateCustomerDto {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

/* ── Invoice ── */

export type InvoiceStatus = 'DRAFT' | 'VALIDATED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
export type PaymentMethodType = 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';

export interface InvoiceLineRequest {
  productId: string;
  quantity: number;
}

export interface CreateInvoiceDto {
  shopId: string;
  customerId?: string;
  lines: InvoiceLineRequest[];
  notes?: string;
}

export interface InvoiceLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number;
  lineTotal: number;
}

export interface PaymentInfo {
  id: string;
  method: PaymentMethodType;
  amount: number;
  reference: string | null;
  notes: string | null;
  receivedBy: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  shopId: string;
  shopName: string;
  customerId: string | null;
  customerName: string | null;
  subtotal: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes: string | null;
  createdBy: string;
  lines: InvoiceLine[];
  payments: PaymentInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  shopId?: string;
  status?: InvoiceStatus;
}

export interface CreatePaymentDto {
  invoiceId: string;
  method: PaymentMethodType;
  amount: number;
  reference?: string;
  notes?: string;
}

/* ── Reports ── */

export interface RevenuePeriod {
  period: string;
  revenue: number;
  tax: number;
  count: number;
}

export interface RevenueReport {
  totalRevenue: number;
  totalTax: number;
  totalPaid: number;
  totalDue: number;
  invoiceCount: number;
  periods: RevenuePeriod[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  sku: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface MarginReport {
  productId: string;
  productName: string;
  sku: string;
  buyPrice: number;
  sellPrice: number;
  marginPerUnit: number;
  marginPercent: number;
  totalSold: number;
  totalMargin: number;
}

export interface StockPoint {
  date: string;
  entries: number;
  exits: number;
  net: number;
}

export interface StockEvolution {
  points: StockPoint[];
}

export interface ReportFilters {
  shopId?: string;
  from: string;
  to: string;
}

/* ── Notifications ── */

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationCount {
  unreadCount: number;
}

/* ── API namespaces ── */

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
  shopName: string;
}

export const authApi = {
  register(data: RegisterDto) {
    return request<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

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
    // Backend uses 0-indexed pages, frontend uses 1-indexed
    if (filters.page !== undefined) params.set('page', String(Math.max(0, filters.page - 1)));
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
    return request<StockLevel[]>(`/api/stock/shops/${shopId}`);
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

export const customersApi = {
  list() {
    return request<Customer[]>('/api/customers');
  },

  getById(id: string) {
    return request<Customer>(`/api/customers/${id}`);
  },

  create(dto: CreateCustomerDto) {
    return request<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  update(id: string, dto: UpdateCustomerDto) {
    return request<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  delete(id: string) {
    return request<void>(`/api/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

export const invoicesApi = {
  list(filters: InvoiceFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters.shopId) params.set('shopId', filters.shopId);
    if (filters.status) params.set('status', filters.status);
    const qs = params.toString();
    return request<PaginatedResponse<Invoice>>(
      `/api/invoices${qs ? `?${qs}` : ''}`,
    );
  },

  getById(id: string) {
    return request<Invoice>(`/api/invoices/${id}`);
  },

  create(dto: CreateInvoiceDto) {
    return request<Invoice>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  validate(id: string) {
    return request<Invoice>(`/api/invoices/${id}/validate`, {
      method: 'POST',
    });
  },

  cancel(id: string) {
    return request<Invoice>(`/api/invoices/${id}/cancel`, {
      method: 'POST',
    });
  },

  addPayment(dto: CreatePaymentDto) {
    return request<Invoice>('/api/invoices/payments', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async downloadPdf(id: string): Promise<Blob> {
    const response = await fetch(`/api/invoices/${id}/pdf`, {
      credentials: 'include',
    });
    if (!response.ok) throw { status: response.status, message: 'PDF download failed' };
    return response.blob();
  },

  async downloadDeliveryNote(id: string): Promise<Blob> {
    const response = await fetch(`/api/invoices/${id}/delivery-note`, {
      credentials: 'include',
    });
    if (!response.ok) throw { status: response.status, message: 'PDF download failed' };
    return response.blob();
  },
};

export const reportsApi = {
  revenue(filters: ReportFilters) {
    const params = new URLSearchParams();
    params.set('from', filters.from);
    params.set('to', filters.to);
    if (filters.shopId) params.set('shopId', filters.shopId);
    return request<RevenueReport>(`/api/reports/revenue?${params}`);
  },

  topProducts(filters: ReportFilters & { limit?: number }) {
    const params = new URLSearchParams();
    params.set('from', filters.from);
    params.set('to', filters.to);
    if (filters.shopId) params.set('shopId', filters.shopId);
    if (filters.limit) params.set('limit', String(filters.limit));
    return request<TopProduct[]>(`/api/reports/top-products?${params}`);
  },

  margins(filters: ReportFilters) {
    const params = new URLSearchParams();
    params.set('from', filters.from);
    params.set('to', filters.to);
    if (filters.shopId) params.set('shopId', filters.shopId);
    return request<MarginReport[]>(`/api/reports/margins?${params}`);
  },

  stockEvolution(filters: ReportFilters) {
    const params = new URLSearchParams();
    params.set('from', filters.from);
    params.set('to', filters.to);
    if (filters.shopId) params.set('shopId', filters.shopId);
    return request<StockEvolution>(`/api/reports/stock-evolution?${params}`);
  },
};

export const notificationsApi = {
  list(page = 0, limit = 20) {
    return request<PaginatedResponse<NotificationItem>>(
      `/api/notifications?page=${page}&limit=${limit}`,
    );
  },

  count() {
    return request<NotificationCount>('/api/notifications/count');
  },

  markRead(id: string) {
    return request<void>(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  markAllRead() {
    return request<void>('/api/notifications/read-all', {
      method: 'POST',
    });
  },

  generateAlerts() {
    return request<void>('/api/notifications/generate-alerts', {
      method: 'POST',
    });
  },
};
