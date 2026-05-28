import { jwtVerify, SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || "govintel-super-secret-key-change-in-production"
);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  department: string | null;
  [key: string]: any;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as JwtPayload;
  } catch (error) {
    return null;
  }
}

import { cookies } from "next/headers";
export async function getUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("govintel-session")?.value;
  if (!sessionCookie) return null;
  return verifyToken(sessionCookie);
}
