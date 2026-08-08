-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "holdsUntil" TIMESTAMP(3),
ADD COLUMN "expiredAt" TIMESTAMP(3);

-- Backfill PENDING holds from createdAt + 24h; other rows get createdAt + 24h as a safe default
UPDATE "Order"
SET "holdsUntil" = "createdAt" + INTERVAL '24 hours'
WHERE "holdsUntil" IS NULL;

ALTER TABLE "Order" ALTER COLUMN "holdsUntil" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Order_status_holdsUntil_idx" ON "Order"("status", "holdsUntil");
