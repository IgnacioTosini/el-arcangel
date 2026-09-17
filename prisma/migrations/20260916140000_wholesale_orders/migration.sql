ALTER TABLE "Order" ADD COLUMN "wholesaleAccountId" TEXT;
ALTER TABLE "Order" ADD CONSTRAINT "Order_wholesaleAccountId_fkey" FOREIGN KEY ("wholesaleAccountId") REFERENCES "WholesaleAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Order_wholesaleAccountId_idx" ON "Order"("wholesaleAccountId");
