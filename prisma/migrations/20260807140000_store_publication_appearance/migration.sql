-- AlterEnum
CREATE TYPE "StoreStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterEnum
CREATE TYPE "FontPairing" AS ENUM ('MODERN', 'CLASSIC', 'EDITORIAL');

-- AlterTable
ALTER TABLE "Store"
ADD COLUMN "status" "StoreStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "primaryColor" TEXT NOT NULL DEFAULT '#0F172A',
ADD COLUMN "accentColor" TEXT NOT NULL DEFAULT '#C45C26',
ADD COLUMN "backgroundColor" TEXT NOT NULL DEFAULT '#FAFAF8',
ADD COLUMN "fontPairing" "FontPairing" NOT NULL DEFAULT 'MODERN',
ADD COLUMN "tagline" TEXT;

-- CreateIndex
CREATE INDEX "Store_status_idx" ON "Store"("status");

-- CreateIndex
CREATE INDEX "Store_storeSlug_status_idx" ON "Store"("storeSlug", "status");
