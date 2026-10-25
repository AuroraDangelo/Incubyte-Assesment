import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestDatabase } from '../test/helpers';
import { VehicleRepository } from '../repositories/vehicleRepository';
import { VehicleService } from './vehicleService';
import { NotFoundError, ValidationError } from '../errors';

const civic = { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 5 };
const f150 = { make: 'Ford', model: 'F-150', category: 'Truck', price: 38000, quantity: 2 };
const model3 = { make: 'Tesla', model: 'Model 3', category: 'Sedan', price: 42000, quantity: 0 };

describe('VehicleService – catalogue', () => {
  let cleanup: () => void;
  let service: VehicleService;

  beforeEach(() => {
    const t = createTestDatabase();
    cleanup = t.cleanup;
    service = new VehicleService(new VehicleRepository(t.db));
  });
  afterEach(() => cleanup());

  describe('create', () => {
    it('stores a vehicle and assigns a unique id', () => {
      const a = service.create(civic);
      const b = service.create(f150);
      expect(a).toMatchObject(civic);
      expect(a.id).not.toBe(b.id);
    });

    it.each([
      ['missing make', { ...civic, make: '' }],
      ['negative price', { ...civic, price: -1 }],
      ['fractional quantity', { ...civic, quantity: 1.5 }],
      ['negative quantity', { ...civic, quantity: -3 }],
      ['non-numeric price', { ...civic, price: 'cheap' }],
    ])('rejects %s', (_label, input) => {
      expect(() => service.create(input)).toThrow(ValidationError);
    });
  });

  describe('list / get', () => {
    it('lists every vehicle including out-of-stock ones', () => {
      [civic, f150, model3].forEach((v) => service.create(v));
      expect(service.list()).toHaveLength(3);
    });

    it('throws NotFoundError for an unknown id', () => {
      expect(() => service.get(999)).toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('applies a partial update and leaves other fields untouched', () => {
      const v = service.create(civic);
      const updated = service.update(v.id, { price: 21000 });
      expect(updated).toMatchObject({ ...civic, price: 21000, id: v.id });
    });

    it('rejects an empty update and unknown ids', () => {
      const v = service.create(civic);
      expect(() => service.update(v.id, {})).toThrow(ValidationError);
      expect(() => service.update(999, { price: 1 })).toThrow(NotFoundError);
    });
  });

  describe('remove', () => {
    it('deletes a vehicle', () => {
      const v = service.create(civic);
      service.remove(v.id);
      expect(() => service.get(v.id)).toThrow(NotFoundError);
    });
    it('throws NotFoundError when deleting something that does not exist', () => {
      expect(() => service.remove(42)).toThrow(NotFoundError);
    });
  });

  describe('search', () => {
    beforeEach(() => [civic, f150, model3].forEach((v) => service.create(v)));

    it('matches make case-insensitively and partially', () => {
      expect(service.search({ make: 'hon' }).map((v) => v.model)).toEqual(['Civic']);
    });
    it('matches model and category', () => {
      expect(service.search({ model: 'model' })).toHaveLength(1);
      expect(service.search({ category: 'sedan' })).toHaveLength(2);
    });
    it('filters by price range (inclusive)', () => {
      expect(service.search({ minPrice: '22000', maxPrice: '38000' }).map((v) => v.model).sort()).toEqual([
        'Civic',
        'F-150',
      ]);
      expect(service.search({ minPrice: '40000' })).toHaveLength(1);
    });
    it('combines filters with AND', () => {
      expect(service.search({ category: 'sedan', maxPrice: '30000' }).map((v) => v.make)).toEqual(['Honda']);
    });
    it('treats SQL wildcard characters in input literally', () => {
      expect(service.search({ make: '%' })).toHaveLength(0);
    });
    it('rejects a nonsensical price range', () => {
      expect(() => service.search({ minPrice: '50', maxPrice: '10' })).toThrow(ValidationError);
      expect(() => service.search({ minPrice: 'abc' })).toThrow(ValidationError);
    });
  });
});
