import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createTestDatabase } from './test/helpers';
import { createApp } from './app';
import { UserRepository } from './repositories/userRepository';
import bcrypt from 'bcryptjs';

const civic = { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 2 };
const truck = { make: 'Ford', model: 'F-150', category: 'Truck', price: 38000, quantity: 1 };

describe('HTTP API', () => {
  let app: Express;
  let cleanup: () => void;
  let userToken: string;
  let adminToken: string;

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  beforeEach(async () => {
    const t = createTestDatabase();
    cleanup = t.cleanup;
    app = createApp({ db: t.db, jwtSecret: 'test', jwtExpiresIn: '1h' });

    // Seed an admin directly (public registration can never create one).
    new UserRepository(t.db).create({
      name: 'Boss',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('Admin123!', 4),
      role: 'admin',
    });
    await request(app).post('/api/auth/register').send({ name: 'Ada', email: 'ada@example.com', password: 'Passw0rd!' });
    userToken = (await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'Passw0rd!' })).body.token;
    adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'Admin123!' })).body.token;
  });
  afterEach(() => cleanup());

  describe('auth', () => {
    it('POST /register returns 201 and no password data', async () => {
      const res = await request(app).post('/api/auth/register').send({ name: 'Bo', email: 'bo@example.com', password: 'Passw0rd!' });
      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({ email: 'bo@example.com', role: 'user' });
      expect(JSON.stringify(res.body)).not.toMatch(/hash|Passw0rd/i);
    });
    it('ignores a client-supplied role (no privilege escalation)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Eve', email: 'eve@example.com', password: 'Passw0rd!', role: 'admin' });
      expect(res.body.user.role).toBe('user');
    });
    it('POST /register -> 400 on invalid body, 409 on duplicate', async () => {
      expect((await request(app).post('/api/auth/register').send({ email: 'x' })).status).toBe(400);
      expect((await request(app).post('/api/auth/register').send({ name: 'Ada', email: 'ada@example.com', password: 'Passw0rd!' })).status).toBe(409);
    });
    it('POST /login returns token + user, 401 for bad credentials', async () => {
      const ok = await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'Passw0rd!' });
      expect(ok.status).toBe(200);
      expect(ok.body.token).toBeTypeOf('string');
      expect((await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'nope-nope' })).status).toBe(401);
    });
  });

  describe('protection', () => {
    it.each([
      ['get', '/api/vehicles'],
      ['get', '/api/vehicles/search'],
      ['post', '/api/vehicles'],
      ['put', '/api/vehicles/1'],
      ['delete', '/api/vehicles/1'],
      ['post', '/api/vehicles/1/purchase'],
      ['post', '/api/vehicles/1/restock'],
    ])('%s %s requires a token', async (method, url) => {
      const res = await (request(app) as any)[method](url);
      expect(res.status).toBe(401);
    });
    it('rejects a malformed token', async () => {
      expect((await request(app).get('/api/vehicles').set(auth('bad.token.here'))).status).toBe(401);
    });
  });

  describe('vehicles', () => {
    it('POST creates (201) and validates (400)', async () => {
      const ok = await request(app).post('/api/vehicles').set(auth(userToken)).send(civic);
      expect(ok.status).toBe(201);
      expect(ok.body).toMatchObject(civic);
      expect((await request(app).post('/api/vehicles').set(auth(userToken)).send({ ...civic, price: -5 })).status).toBe(400);
    });

    it('GET lists all vehicles', async () => {
      await request(app).post('/api/vehicles').set(auth(adminToken)).send(civic);
      await request(app).post('/api/vehicles').set(auth(adminToken)).send(truck);
      const res = await request(app).get('/api/vehicles').set(auth(userToken));
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('GET /search filters by make, category and price range', async () => {
      await request(app).post('/api/vehicles').set(auth(adminToken)).send(civic);
      await request(app).post('/api/vehicles').set(auth(adminToken)).send(truck);
      const byMake = await request(app).get('/api/vehicles/search?make=ford').set(auth(userToken));
      expect(byMake.body.map((v: any) => v.model)).toEqual(['F-150']);
      const byPrice = await request(app).get('/api/vehicles/search?minPrice=20000&maxPrice=30000').set(auth(userToken));
      expect(byPrice.body.map((v: any) => v.model)).toEqual(['Civic']);
      expect((await request(app).get('/api/vehicles/search?minPrice=abc').set(auth(userToken))).status).toBe(400);
    });

    it('PUT updates (200) and 404s for unknown ids', async () => {
      const { body } = await request(app).post('/api/vehicles').set(auth(adminToken)).send(civic);
      const res = await request(app).put(`/api/vehicles/${body.id}`).set(auth(userToken)).send({ price: 20000 });
      expect(res.status).toBe(200);
      expect(res.body.price).toBe(20000);
      expect((await request(app).put('/api/vehicles/999').set(auth(userToken)).send({ price: 1 })).status).toBe(404);
    });

    it('DELETE is admin-only', async () => {
      const { body } = await request(app).post('/api/vehicles').set(auth(adminToken)).send(civic);
      expect((await request(app).delete(`/api/vehicles/${body.id}`).set(auth(userToken))).status).toBe(403);
      expect((await request(app).delete(`/api/vehicles/${body.id}`).set(auth(adminToken))).status).toBe(204);
      expect((await request(app).delete(`/api/vehicles/${body.id}`).set(auth(adminToken))).status).toBe(404);
    });

    it('rejects a non-numeric id with 400', async () => {
      expect((await request(app).put('/api/vehicles/abc').set(auth(userToken)).send({ price: 1 })).status).toBe(400);
    });
  });

  describe('inventory', () => {
    let id: number;
    beforeEach(async () => {
      id = (await request(app).post('/api/vehicles').set(auth(adminToken)).send(truck)).body.id;
    });

    it('purchase decrements stock, then 409 when sold out', async () => {
      const first = await request(app).post(`/api/vehicles/${id}/purchase`).set(auth(userToken)).send({});
      expect(first.status).toBe(200);
      expect(first.body.quantity).toBe(0);
      const second = await request(app).post(`/api/vehicles/${id}/purchase`).set(auth(userToken)).send({});
      expect(second.status).toBe(409);
    });

    it('restock is admin-only and increases stock', async () => {
      expect((await request(app).post(`/api/vehicles/${id}/restock`).set(auth(userToken)).send({ quantity: 5 })).status).toBe(403);
      const res = await request(app).post(`/api/vehicles/${id}/restock`).set(auth(adminToken)).send({ quantity: 5 });
      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(6);
      expect((await request(app).post(`/api/vehicles/${id}/restock`).set(auth(adminToken)).send({ quantity: 0 })).status).toBe(400);
    });

    it('purchase/restock 404 for unknown vehicles', async () => {
      expect((await request(app).post('/api/vehicles/999/purchase').set(auth(userToken)).send({})).status).toBe(404);
    });
  });

  it('GET /api/health is public', async () => {
    expect((await request(app).get('/api/health')).status).toBe(200);
  });
  it('unknown routes return a JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTypeOf('string');
  });
});
