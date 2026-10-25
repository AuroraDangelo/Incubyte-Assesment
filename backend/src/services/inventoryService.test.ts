import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestDatabase } from '../test/helpers';
import { VehicleRepository } from '../repositories/vehicleRepository';
import { VehicleService } from './vehicleService';
import { InventoryService } from './inventoryService';
import { ConflictError, NotFoundError, ValidationError } from '../errors';

describe('InventoryService', () => {
  let cleanup: () => void;
  let vehicles: VehicleService;
  let inventory: InventoryService;
  let id: number;

  beforeEach(() => {
    const t = createTestDatabase();
    cleanup = t.cleanup;
    const repo = new VehicleRepository(t.db);
    vehicles = new VehicleService(repo);
    inventory = new InventoryService(repo);
    id = vehicles.create({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 3 }).id;
  });
  afterEach(() => cleanup());

  describe('purchase', () => {
    it('decrements stock by one by default', () => {
      expect(inventory.purchase(id, {}).quantity).toBe(2);
    });
    it('supports buying several units at once', () => {
      expect(inventory.purchase(id, { quantity: 3 }).quantity).toBe(0);
    });
    it('refuses to oversell and leaves stock unchanged', () => {
      expect(() => inventory.purchase(id, { quantity: 4 })).toThrow(ConflictError);
      expect(vehicles.get(id).quantity).toBe(3);
    });
    it('refuses to buy an out-of-stock vehicle', () => {
      inventory.purchase(id, { quantity: 3 });
      expect(() => inventory.purchase(id, {})).toThrow(ConflictError);
    });
    it('rejects zero, negative and fractional quantities', () => {
      for (const quantity of [0, -1, 1.5, 'x']) {
        expect(() => inventory.purchase(id, { quantity })).toThrow(ValidationError);
      }
    });
    it('throws NotFoundError for unknown vehicles', () => {
      expect(() => inventory.purchase(999, {})).toThrow(NotFoundError);
    });
  });

  describe('restock', () => {
    it('increases stock by the given amount', () => {
      expect(inventory.restock(id, { quantity: 10 }).quantity).toBe(13);
    });
    it('requires a positive whole quantity', () => {
      expect(() => inventory.restock(id, {})).toThrow(ValidationError);
      expect(() => inventory.restock(id, { quantity: 0 })).toThrow(ValidationError);
    });
    it('throws NotFoundError for unknown vehicles', () => {
      expect(() => inventory.restock(999, { quantity: 1 })).toThrow(NotFoundError);
    });
  });
});
