import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, NotFoundError } from '../errors';

export const notFoundHandler: RequestHandler = (req, _res, next) =>
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));

/** Converts thrown errors into a consistent `{ error, details? }` JSON body. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
  }
  // Malformed JSON bodies surface from express.json() as SyntaxError with status 400.
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body' });
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
};
