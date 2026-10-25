import { Router } from 'express';
import type { AuthService } from '../services/authService';

export function authRoutes(auth: AuthService): Router {
  const router = Router();

  router.post('/register', async (req, res, next) => {
    try {
      // Only whitelisted fields are forwarded: a client can never choose its own role.
      const { name, email, password } = req.body ?? {};
      const user = await auth.register({ name, email, password });
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      res.json(await auth.login(req.body ?? {}));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
