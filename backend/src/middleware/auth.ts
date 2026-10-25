import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors';
import type { AuthService } from '../services/authService';
import type { AuthContext, Role } from '../types';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthContext;
  }
}

/** Verifies the `Authorization: Bearer <jwt>` header and attaches `req.auth`. */
export const authenticate =
  (authService: AuthService): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const [scheme, token] = (req.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) return next(new UnauthorizedError());
    try {
      req.auth = authService.verifyToken(token);
      next();
    } catch (err) {
      next(err);
    }
  };

/** Allows the request through only for users holding the given role. */
export const requireRole =
  (role: Role): RequestHandler =>
  (req, _res, next) => (req.auth?.role === role ? next() : next(new ForbiddenError()));
