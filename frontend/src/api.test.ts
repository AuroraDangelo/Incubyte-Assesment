import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, buildSearchQuery } from './api';

describe('buildSearchQuery', () => {
  it('drops empty filters and encodes values', () => {
    expect(buildSearchQuery({ make: 'Ford', model: '', category: 'SUV & Van', minPrice: '', maxPrice: '5000' })).toBe(
      'make=Ford&category=SUV+%26+Van&maxPrice=5000',
    );
  });
  it('returns an empty string when nothing is set', () => {
    expect(buildSearchQuery({})).toBe('');
  });
});

describe('api client', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    api.setToken('abc');
  });
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });
  const ok = (body: unknown, status = 200) => ({ ok: true, status, json: async () => body });

  it('sends the bearer token and JSON body', async () => {
    fetchMock.mockResolvedValue(ok({ id: 1 }));
    await api.purchase(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/vehicles/1/purchase');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer abc');
  });

  it('uses /search when filters are present and the plain list otherwise', async () => {
    fetchMock.mockResolvedValue(ok([]));
    await api.listVehicles({ make: 'Ford' });
    await api.listVehicles({});
    expect(fetchMock.mock.calls[0][0]).toBe('/api/vehicles/search?make=Ford');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/vehicles');
  });

  it('throws ApiError carrying the server message and status', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: 'Out of stock' }) });
    await expect(api.purchase(1)).rejects.toMatchObject({ message: 'Out of stock', status: 409 });
    await expect(api.purchase(1)).rejects.toBeInstanceOf(ApiError);
  });
});
