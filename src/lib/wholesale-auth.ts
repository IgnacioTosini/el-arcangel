import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { prisma } from "./prisma";

const derive = promisify(scrypt);
export const wholesaleCookie = "wholesale-session";
export const sessionDuration = 7 * 24 * 60 * 60;
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await derive(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}
export async function checkPassword(password: string, stored: string) {
  const [salt, value] = stored.split(":");
  const hash = (await derive(password, salt, 64)) as Buffer;
  const expected = Buffer.from(value, "hex");
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function createWholesaleSession(accountId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.wholesaleSession.create({
    data: {
      accountId,
      tokenHash: tokenHash(token),
      expiresAt: new Date(Date.now() + sessionDuration * 1000),
    },
  });
  return token;
}
export async function readWholesaleSession(token?: string) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await prisma.wholesaleSession.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: { account: true },
  });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  const { id, name, business, email, phone, status } = session.account;
  return { id, name, business, email, phone, status };
}
export async function getWholesaleAccount() {
  const { cookies } = await import("next/headers");
  return readWholesaleSession((await cookies()).get(wholesaleCookie)?.value);
}
export async function getApprovedWholesaleAccount() {
  const account = await getWholesaleAccount();
  return account?.status === "APPROVED" ? account : null;
}
