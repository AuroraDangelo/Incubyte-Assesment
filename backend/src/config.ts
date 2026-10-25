/** Centralised, validated environment configuration. */
export interface Config {
  port: number;
  dbPath: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin?: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const jwtSecret = env.JWT_SECRET ?? (env.NODE_ENV === 'production' ? '' : 'dev-only-secret-change-me');
  if (!jwtSecret) throw new Error('JWT_SECRET must be set in production');
  return {
    port: Number(env.PORT ?? 4000),
    dbPath: env.DB_PATH ?? './dealership.db',
    jwtSecret,
    jwtExpiresIn: env.JWT_EXPIRES_IN ?? '8h',
    corsOrigin: env.CORS_ORIGIN,
  };
}
