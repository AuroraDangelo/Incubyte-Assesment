import { Router } from 'express';
import type { RequestHandler } from 'express';
import { ValidationError } from '../errors';
import { requireRole } from '../middleware/auth';
import type { InventoryService } from '../services/inventoryService';
import type { VehicleService } from '../services/vehicleService';

/** Wraps a sync handler so thrown errors reach the error middleware. */
const handle =
  (fn: (...args: Parameters<RequestHandler>) => unknown): RequestHandler =>
  (req, res, next) => {
    try {
      fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };

const idParam = (raw: string | string[] | undefined): number => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new ValidationError('Vehicle id must be a positive integer');
  return id;
};

/** All routes here are mounted behind `authenticate`. */
export function vehicleRoutes(vehicles: VehicleService, inventory: InventoryService): Router {
  const router = Router();
  const adminOnly = requireRole('admin');

  router.post('/', handle((req, res) => res.status(201).json(vehicles.create(req.body))));
  router.get('/', handle((_req, res) => res.json(vehicles.list())));
  // NOTE: must be declared before '/:id' so "search" is not parsed as an id.
  router.get('/search', handle((req, res) => res.json(vehicles.search(req.query))));
  router.put('/:id', handle((req, res) => res.json(vehicles.update(idParam(req.params.id), req.body))));
  router.delete(
    '/:id',
    adminOnly,
    handle((req, res) => {
      vehicles.remove(idParam(req.params.id));
      res.status(204).end();
    }),
  );
  router.post('/:id/purchase', handle((req, res) => res.json(inventory.purchase(idParam(req.params.id), req.body ?? {}))));
  router.post(
    '/:id/restock',
    adminOnly,
    handle((req, res) => res.json(inventory.restock(idParam(req.params.id), req.body ?? {}))),
  );

  return router;
}
