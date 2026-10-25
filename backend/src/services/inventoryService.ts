import { z } from 'zod';
import { ConflictError, NotFoundError } from '../errors';
import type { VehicleRepository } from '../repositories/vehicleRepository';
import type { Vehicle } from '../types';
import { parseOrThrow } from './authService';

const quantitySchema = z.object({
  quantity: z
    .number({ error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be at least 1'),
});

/** Stock-changing use-cases: purchasing and restocking. */
export class InventoryService {
  constructor(private readonly vehicles: VehicleRepository) {}

  /** Buys `quantity` units (default 1). Fails with 409 if stock is insufficient. */
  purchase(id: number, input: unknown): Vehicle {
    const { quantity } = parseOrThrow(quantitySchema, { quantity: 1, ...(input as object) });
    const vehicle = this.requireVehicle(id);
    if (!this.vehicles.decrementStock(id, quantity)) {
      throw new ConflictError(
        vehicle.quantity === 0
          ? `${vehicle.make} ${vehicle.model} is out of stock`
          : `Only ${vehicle.quantity} unit(s) of ${vehicle.make} ${vehicle.model} left`,
      );
    }
    return this.requireVehicle(id);
  }

  /** Adds `quantity` units to stock (admin-only at the HTTP layer). */
  restock(id: number, input: unknown): Vehicle {
    const { quantity } = parseOrThrow(quantitySchema, input);
    this.requireVehicle(id);
    this.vehicles.incrementStock(id, quantity);
    return this.requireVehicle(id);
  }

  private requireVehicle(id: number): Vehicle {
    const v = this.vehicles.findById(id);
    if (!v) throw new NotFoundError(`Vehicle ${id} not found`);
    return v;
  }
}
