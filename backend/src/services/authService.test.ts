import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { createTestDatabase } from '../test/helpers';
import { UserRepository } from '../repositories/userRepository';
import { AuthService } from './authService';
import { ConflictError, UnauthorizedError, ValidationError } from '../errors';

const SECRET = 'test-secret';

describe('AuthService', () => {
  let cleanup: () => void;
  let service: AuthService;

  beforeEach(() => {
    const t = createTestDatabase();
    cleanup = t.cleanup;
    service = new AuthService(new UserRepository(t.db), { jwtSecret: SECRET, expiresIn: '1h' });
  });
  afterEach(() => cleanup());

  describe('register', () => {
    it('creates a user with the default "user" role and never exposes the password hash', async () => {
      const user = await service.register({ name: 'Ada', email: 'ada@example.com', password: 'Passw0rd!' });
      expect(user).toMatchObject({ name: 'Ada', email: 'ada@example.com', role: 'user' });
      expect(user.id).toBeTypeOf('number');
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('normalises e-mail addresses to lower case', async () => {
      const user = await service.register({ name: 'Ada', email: 'ADA@Example.com', password: 'Passw0rd!' });
      expect(user.email).toBe('ada@example.com');
    });

    it('rejects a duplicate e-mail', async () => {
      await service.register({ name: 'Ada', email: 'ada@example.com', password: 'Passw0rd!' });
      await expect(
        service.register({ name: 'Ada 2', email: 'Ada@example.com', password: 'Passw0rd!' }),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it.each([
      ['invalid e-mail', { name: 'Ada', email: 'nope', password: 'Passw0rd!' }],
      ['short password', { name: 'Ada', email: 'ada@example.com', password: 'short' }],
      ['empty name', { name: ' ', email: 'ada@example.com', password: 'Passw0rd!' }],
    ])('rejects %s', async (_label, input) => {
      await expect(service.register(input)).rejects.toBeInstanceOf(ValidationError);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await service.register({ name: 'Ada', email: 'ada@example.com', password: 'Passw0rd!' });
    });

    it('returns a signed JWT carrying the user id and role', async () => {
      const { token, user } = await service.login({ email: 'ada@example.com', password: 'Passw0rd!' });
      const payload = jwt.verify(token, SECRET) as jwt.JwtPayload;
      expect(payload.sub).toBe(String(user.id));
      expect(payload.role).toBe('user');
    });

    it('rejects a wrong password and an unknown e-mail with the same error', async () => {
      await expect(service.login({ email: 'ada@example.com', password: 'wrong-pass' })).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
      await expect(service.login({ email: 'ghost@example.com', password: 'Passw0rd!' })).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
    });

    it('verifies tokens back into an auth context', async () => {
      const { token, user } = await service.login({ email: 'ada@example.com', password: 'Passw0rd!' });
      expect(service.verifyToken(token)).toEqual({ userId: user.id, role: 'user' });
      expect(() => service.verifyToken('garbage')).toThrow(UnauthorizedError);
    });
  });
});
