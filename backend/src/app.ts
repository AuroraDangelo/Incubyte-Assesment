import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import type { Database } from 'better-sqlite3';
import { authenticate } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { UserRepository } from './repositories/userRepository';
import { VehicleRepository } from './repositories/vehicleRepository';
import { authRoutes } from './routes/authRoutes';
import { vehicleRoutes } from './routes/vehicleRoutes';
import { AuthService } from './services/authService';
import { InventoryService } from './services/inventoryService';
import { VehicleService } from './services/vehicleService';

export interface AppDeps {
  db: Database;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin?: string;
  staticDir?: string;
}

/**
 * Composition root: wires repositories -> services -> routes.
 * Dependencies are injected so tests can supply a temporary database.
 */
export function createApp({ db, jwtSecret, jwtExpiresIn, corsOrigin, staticDir }: AppDeps): Express {
  const authService = new AuthService(new UserRepository(db), { jwtSecret, expiresIn: jwtExpiresIn });
  const vehicleRepo = new VehicleRepository(db);

  const app = express();
  app.use(cors({ origin: corsOrigin ?? true }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes(authService));
  app.use(
    '/api/vehicles',
    authenticate(authService),
    vehicleRoutes(new VehicleService(vehicleRepo), new InventoryService(vehicleRepo)),
  );

  if (staticDir && fs.existsSync(staticDir)) {
    app.use(express.static(staticDir));
    // Serve index.html for all non-API GET requests (SPA client-side routing)
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(staticDir, 'index.html'));
      }
      next();
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
