import { cookies } from "next/headers";
import { createHmac, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getMongoCollection } from "@/lib/mongodb";
import type { SafeUser, Session, User } from "@/types/user";

const USERS_COLLECTION = process.env.AUTH_USERS_COLLECTION ?? "users";
const SESSIONS_COLLECTION = process.env.AUTH_SESSIONS_COLLECTION ?? "sessions";
const SESSION_COOKIE = process.env.AUTH_SESSION_COOKIE ?? "rapideat_session";
const SESSION_TTL_DAYS = Number(process.env.AUTH_SESSION_TTL_DAYS ?? "7");
const AUTH_SECRET = process.env.AUTH_SECRET ?? "dev-secret";

const sessionExpiryMs = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export const getUsersCollection = async () =>
  getMongoCollection<User>(USERS_COLLECTION);

export const getSessionsCollection = async () =>
  getMongoCollection<Session>(SESSIONS_COLLECTION);

// PASSWORD HELPERS

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

function hashToken(token: string) {
  return createHmac("sha256", AUTH_SECRET).update(token).digest("hex");
}

async function deleteSessionRecord(sessionToken: string) {
  const sessions = await getSessionsCollection();
  await sessions.deleteOne({ tokenHash: hashToken(sessionToken) });
}

// CREATE USER

export async function createUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const users = await getUsersCollection();
  const passwordHash = await hashPassword(password);
  const now = new Date();

  const user: User = {
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "user",
    createdAt: now,
    updatedAt: now,
  };

  const result = await users.insertOne(user);

  return { ...user, _id: result.insertedId.toString() };
}

export async function findUserByEmail(email: string) {
  const users = await getUsersCollection();
  return users.findOne({ email: email.toLowerCase() });
}

// CREATE SESSION 


export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + sessionExpiryMs);

  const sessions = await getSessionsCollection();
  await sessions.insertOne({
    userId,
    tokenHash,
    createdAt: new Date(),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

// DESTROY SESSION 


export async function destroySession(token?: string | null) {
  // ✅ FIXED: Await cookies() before calling .get()
  const cookieStore = await cookies();
  const sessionToken = token ?? cookieStore.get(SESSION_COOKIE)?.value;
  
  if (!sessionToken) return;

  await deleteSessionRecord(sessionToken);

  // ✅ FIXED: Already have cookieStore from above
  cookieStore.delete(SESSION_COOKIE);
}

// CURRENT USER 

function toSafeUser(user: User): SafeUser {
  const id =
    typeof user._id === "string"
      ? user._id
      : user._id instanceof ObjectId
        ? user._id.toString()
        : "";

  return {
    _id: id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  // ✅ FIXED: Await cookies() before calling .get()
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (!sessionToken) return null;

  const sessions = await getSessionsCollection();
  const session = await sessions.findOne({
    tokenHash: hashToken(sessionToken),
  });

  if (!session || session.expiresAt < new Date()) {
    await deleteSessionRecord(sessionToken);
    return null;
  }

  const users = await getUsersCollection();
  const user = await users.findOne({
    _id: new ObjectId(session.userId) as never,
  });

  if (!user) {
    await deleteSessionRecord(sessionToken);
    return null;
  }

  return toSafeUser(user);
}