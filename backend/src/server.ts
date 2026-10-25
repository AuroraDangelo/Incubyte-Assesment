import fs from 'fs';
import path from 'path';
import { createApp } from './app';
import { loadConfig } from './config';
import { createDatabase } from './db';
import { seedDatabase } from './seed';

const config = loadConfig();
const db = createDatabase(config.dbPath);

// Automatically seed admin and sample showroom inventory if empty
seedDatabase(db);

const staticCandidates = [
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
];
const staticDir = staticCandidates.find((candidate) => fs.existsSync(candidate));

const app = createApp({
  db,
  jwtSecret: config.jwtSecret,
  jwtExpiresIn: config.jwtExpiresIn,
  corsOrigin: config.corsOrigin,
  staticDir,
});

app.listen(config.port, () => console.log(`Dealership API listening on http://localhost:${config.port}`));
