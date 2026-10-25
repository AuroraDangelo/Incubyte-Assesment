import type { Filters, User, Vehicle, VehicleInput } from './types';

/** Error carrying the HTTP status and the message sent by the API. */
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Serialises non-empty filters into a query string (no leading "?"). */
export function buildSearchQuery(filters: Filters): string {
  const params = new URLSearchParams();
  (Object.entries(filters) as [string, string | undefined][]).forEach(([k, v]) => {
    if (v && v.trim()) params.set(k, v.trim());
  });
  return params.toString();
}

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // An expired/invalid token on a protected call should drop the session.
    if (res.status === 401 && token && onUnauthorized) onUnauthorized();
    throw new ApiError(data.error ?? 'Something went wrong', res.status);
  }
  return data as T;
}

export const api = {
  setToken: (t: string | null) => { token = t; },
  onUnauthorized: (fn: (() => void) | null) => { onUnauthorized = fn; },
  register: (name: string, email: string, password: string) =>
    request<{ user: User }>('POST', '/auth/register', { name, email, password }),
  login: (email: string, password: string) => request<{ token: string; user: User }>('POST', '/auth/login', { email, password }),
  listVehicles: (filters: Filters = {}) => {
    const qs = buildSearchQuery(filters);
    return request<Vehicle[]>('GET', qs ? `/vehicles/search?${qs}` : '/vehicles');
  },
  createVehicle: (v: VehicleInput) => request<Vehicle>('POST', '/vehicles', v),
  updateVehicle: (id: number, v: Partial<VehicleInput>) => request<Vehicle>('PUT', `/vehicles/${id}`, v),
  deleteVehicle: (id: number) => request<void>('DELETE', `/vehicles/${id}`),
  purchase: (id: number) => request<Vehicle>('POST', `/vehicles/${id}/purchase`, {}),
  restock: (id: number, quantity: number) => request<Vehicle>('POST', `/vehicles/${id}/restock`, { quantity }),
};
