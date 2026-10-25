import type { z } from 'zod';
import { ValidationError } from './errors';

/** Parses with zod and converts failures into a ValidationError (HTTP 400). */
export function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    throw new ValidationError(issues[0]?.message ?? 'Validation failed', issues);
  }
  return result.data;
}
