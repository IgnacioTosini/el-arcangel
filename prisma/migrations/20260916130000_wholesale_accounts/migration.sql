CREATE TYPE "WholesaleStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TABLE "WholesaleAccount" (
 "id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "business" TEXT NOT NULL,
 "phone" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
 "status" "WholesaleStatus" NOT NULL DEFAULT 'PENDING',
 "failedLogins" INTEGER NOT NULL DEFAULT 0, "lockedUntil" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "WholesaleAccount_email_key" ON "WholesaleAccount"("email");
CREATE TABLE "WholesaleSession" (
 "tokenHash" TEXT PRIMARY KEY, "accountId" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "WholesaleSession_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "WholesaleAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "WholesaleSession_accountId_idx" ON "WholesaleSession"("accountId");
