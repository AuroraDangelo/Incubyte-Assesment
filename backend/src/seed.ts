/**
 * Seeds an admin account and sample inventory (idempotent).
 * Run with: npm run seed
 */
import bcrypt from 'bcryptjs';
import { loadConfig } from './config';
import { createDatabase } from './db';
import { UserRepository } from './repositories/userRepository';
import { VehicleRepository } from './repositories/vehicleRepository';

const config = loadConfig();
const db = createDatabase(config.dbPath);
const users = new UserRepository(db);
const vehicles = new VehicleRepository(db);

const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@dealership.test';
const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@12345';

if (!users.findByEmail(adminEmail)) {
  users.create({ name: 'Showroom Admin', email: adminEmail, passwordHash: bcrypt.hashSync(adminPassword, 10), role: 'admin' });
  console.log(`Created admin ${adminEmail} / ${adminPassword}`);
}

if (vehicles.findAll().length === 0) {
  const samples = [
    ['Toyota', 'Corolla', 'Sedan', 21500, 8],
    ['Honda', 'Civic', 'Sedan', 23800, 5],
    ['Tesla', 'Model 3', 'Electric', 41990, 3],
    ['Ford', 'F-150', 'Truck', 38900, 4],
    ['Subaru', 'Outback', 'Wagon', 29450, 6],
    ['BMW', 'X5', 'SUV', 65900, 2],
    ['Mazda', 'MX-5 Miata', 'Convertible', 29900, 1],
    ['Hyundai', 'Ioniq 5', 'Electric', 43650, 0],
    ['Jeep', 'Wrangler', 'SUV', 36200, 3],
    ['Porsche', '911 Carrera', 'Coupe', 114400, 1],
  ] as const;
  samples.forEach(([make, model, category, price, quantity]) => vehicles.create({ make, model, category, price, quantity }));
  console.log(`Seeded ${samples.length} vehicles`);
}
db.close();
