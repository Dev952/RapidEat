import type { ObjectId } from 'mongodb';

export type UserRole = 'user' | 'admin';

export type SafeUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export interface User {
  _id?: string | ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  _id?: string;
  userId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
}

export type AuthResult =
  | { success: true; message: string }
  | { success: false; message: string; fieldErrors?: Record<string, string> };

