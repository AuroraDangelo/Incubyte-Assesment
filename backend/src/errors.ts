/** Base class for errors that map cleanly onto an HTTP status code. */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 400, details);
  }
}
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to do that') {
    super(message, 403);
  }
}
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}
export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}
