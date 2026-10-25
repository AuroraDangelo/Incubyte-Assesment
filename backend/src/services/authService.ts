import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ConflictError, UnauthorizedError, ValidationError } from '../errors';
import type { UserRepository } from '../repositories/userRepository';
import type { AuthContext, Role, User } from '../types';

export interface AuthConfig {
  jwtSecret: string;
  expiresIn: string;
}

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().toLowerCase().email('A valid e-mail is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const BCRYPT_ROUNDS = 10;

/** Parses with zod and converts failures into a ValidationError. */
export function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    throw new ValidationError(issues[0]?.message ?? 'Validation failed', issues);
  }
  return result.data;
}

/** Registration, login and JWT handling. */
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly config: AuthConfig,
  ) {}

  async register(input: unknown, role: Role = 'user'): Promise<User> {
    const data = parseOrThrow(registerSchema, input);
    if (this.users.findByEmail(data.email)) throw new ConflictError('E-mail is already registered');
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    return this.users.create({ name: data.name, email: data.email, passwordHash, role });
  }

  async login(input: unknown): Promise<{ token: string; user: User }> {
    const data = parseOrThrow(loginSchema, input);
    const found = this.users.findByEmail(data.email);
    // Same error for "unknown user" and "bad password" to avoid account enumeration.
    const ok = found ? await bcrypt.compare(data.password, found.passwordHash) : false;
    if (!found || !ok) throw new UnauthorizedError('Invalid e-mail or password');

    const { passwordHash: _omit, ...user } = found;
    const token = jwt.sign({ role: user.role }, this.config.jwtSecret, {
      subject: String(user.id),
      expiresIn: this.config.expiresIn as jwt.SignOptions['expiresIn'],
    });
    return { token, user };
  }

  verifyToken(token: string): AuthContext {
    try {
      const payload = jwt.verify(token, this.config.jwtSecret) as jwt.JwtPayload;
      return { userId: Number(payload.sub), role: payload.role as Role };
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}
