export type Role = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface UserWithHash extends User {
  passwordHash: string;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

/** Identity extracted from a verified JWT. */
export interface AuthContext {
  userId: number;
  role: Role;
}
