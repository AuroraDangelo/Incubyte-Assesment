import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

describe('loadConfig', () => {
  it('provides safe development defaults', () => {
    const c = loadConfig({});
    expect(c).toMatchObject({ port: 4000, dbPath: './dealership.db', jwtExpiresIn: '8h' });
    expect(c.jwtSecret).not.toBe('');
  });
  it('reads overrides from the environment', () => {
    expect(loadConfig({ PORT: '9000', JWT_SECRET: 's', DB_PATH: '/tmp/x.db' })).toMatchObject({ port: 9000, jwtSecret: 's', dbPath: '/tmp/x.db' });
  });
  it('refuses to boot in production without JWT_SECRET', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(/JWT_SECRET/);
  });
});
