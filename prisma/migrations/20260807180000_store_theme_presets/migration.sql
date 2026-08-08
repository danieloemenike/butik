-- CreateEnum
CREATE TYPE "StoreColorMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "Store"
ADD COLUMN "darkPrimaryColor" TEXT NOT NULL DEFAULT '#F8FAFC',
ADD COLUMN "darkAccentColor" TEXT NOT NULL DEFAULT '#E07A3D',
ADD COLUMN "darkBackgroundColor" TEXT NOT NULL DEFAULT '#0B1220',
ADD COLUMN "themePreset" TEXT DEFAULT 'atelier',
ADD COLUMN "colorMode" "StoreColorMode" NOT NULL DEFAULT 'SYSTEM';
