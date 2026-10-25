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

if (process.argv.includes('--reset')) {
  db.exec('DELETE FROM vehicles');
  console.log('Cleared existing vehicles.');
}

if (vehicles.findAll().length === 0) {
  const samples = [
    ['Tata', 'Nexon', 'SUV', 1149000, 7],
    ['Mahindra', 'Thar', 'SUV', 1599000, 3],
    ['Maruti Suzuki', 'Swift', 'Hatchback', 749000, 10],
    ['Hyundai', 'Creta', 'SUV', 1489000, 5],
    ['Tata', 'Tiago EV', 'Electric', 949000, 4],
    ['Mahindra', 'XUV700', 'SUV', 2149000, 2],
    ['Toyota', 'Fortuner', 'SUV', 3899000, 2],
    ['Honda', 'City', 'Sedan', 1349000, 4],
    ['Kia', 'Seltos', 'SUV', 1429000, 3],
    ['MG', 'ZS EV', 'Electric', 2299000, 0],
    ['Maruti Suzuki', 'Brezza', 'SUV', 1049000, 6],
    ['BMW', '3 Series', 'Luxury Sedan', 6250000, 1],
  ] as const;
  samples.forEach(([make, model, category, price, quantity]) => vehicles.create({ make, model, category, price, quantity }));
  console.log(`Seeded ${samples.length} vehicles`);
}
db.close();
