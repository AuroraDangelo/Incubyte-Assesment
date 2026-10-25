import { createApp } from './app';
import { loadConfig } from './config';
import { createDatabase } from './db';

const config = loadConfig();
const app = createApp({
  db: createDatabase(config.dbPath),
  jwtSecret: config.jwtSecret,
  jwtExpiresIn: config.jwtExpiresIn,
  corsOrigin: config.corsOrigin,
});

app.listen(config.port, () => console.log(`Dealership API listening on http://localhost:${config.port}`));
