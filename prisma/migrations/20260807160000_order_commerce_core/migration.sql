-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterTable Order: add commerce columns (table empty; safe rewrite of constraints)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "reference" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'NGN';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmationTokenHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);

-- Empty table: assign unique placeholders then enforce uniqueness
UPDATE "Order" SET "reference" = 'LEGACY_' || "id" WHERE "reference" IS NULL OR "reference" = '';
UPDATE "Order" SET "idempotencyKey" = "id" WHERE "idempotencyKey" = '';
UPDATE "Order" SET "confirmationTokenHash" = "id" WHERE "confirmationTokenHash" = '';

CREATE UNIQUE INDEX IF NOT EXISTS "Order_reference_key" ON "Order"("reference");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_storeId_idempotencyKey_key" ON "Order"("storeId", "idempotencyKey");
CREATE INDEX IF NOT EXISTS "Order_storeId_status_idx" ON "Order"("storeId", "status");

ALTER TABLE "Order" ALTER COLUMN "reference" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "confirmationTokenHash" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "idempotencyKey" DROP DEFAULT;

-- AlterTable OrderItem
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "productVariantId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "unitPrice" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "lineTotal" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "variantLabel" TEXT;

CREATE INDEX IF NOT EXISTS "OrderItem_productVariantId_idx" ON "OrderItem"("productVariantId");

-- Recreate FKs with Restrict / SetNull
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_orderId_fkey";
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey";

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_productVariantId_fkey"
  FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
