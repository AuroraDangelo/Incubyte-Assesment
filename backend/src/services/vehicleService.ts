import { z } from 'zod';
import { NotFoundError } from '../errors';
import type { VehicleFilters, VehicleRepository } from '../repositories/vehicleRepository';
import type { Vehicle } from '../types';
import { parseOrThrow } from '../validation';

const text = (label: string) => z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).max(80);

const vehicleSchema = z.object({
  make: text('Make'),
  model: text('Model'),
  category: text('Category'),
  price: z.number({ error: 'Price must be a number' }).nonnegative('Price cannot be negative').finite(),
  quantity: z
    .number({ error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .nonnegative('Quantity cannot be negative'),
});
const updateSchema = vehicleSchema.partial().refine((o) => Object.keys(o).length > 0, {
  message: 'Provide at least one field to update',
});

const priceParam = z.coerce.number({ error: 'Price filter must be a number' }).nonnegative().finite().optional();
const searchSchema = z
  .object({
    make: z.string().trim().optional(),
    model: z.string().trim().optional(),
    category: z.string().trim().optional(),
    minPrice: priceParam,
    maxPrice: priceParam,
  })
  .refine((q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice, {
    message: 'minPrice cannot be greater than maxPrice',
  });

/** Catalogue use-cases: create, read, update, delete and search vehicles. */
export class VehicleService {
  constructor(private readonly vehicles: VehicleRepository) {}

  create(input: unknown): Vehicle {
    return this.vehicles.create(parseOrThrow(vehicleSchema, input));
  }

  list(): Vehicle[] {
    return this.vehicles.findAll();
  }

  get(id: number): Vehicle {
    const v = this.vehicles.findById(id);
    if (!v) throw new NotFoundError(`Vehicle ${id} not found`);
    return v;
  }

  update(id: number, input: unknown): Vehicle {
    const patch = parseOrThrow(updateSchema, input);
    this.get(id);
    return this.vehicles.update(id, patch) as Vehicle;
  }

  remove(id: number): void {
    if (!this.vehicles.delete(id)) throw new NotFoundError(`Vehicle ${id} not found`);
  }

  search(query: unknown): Vehicle[] {
    const filters: VehicleFilters = parseOrThrow(searchSchema, query ?? {});
    return this.vehicles.findAll(filters);
  }
}
