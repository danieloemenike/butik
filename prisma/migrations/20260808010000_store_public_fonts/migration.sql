-- Replace FontPairing enum with selectable public/fonts ids.
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "displayFont" TEXT NOT NULL DEFAULT 'Figtree';
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "bodyFont" TEXT NOT NULL DEFAULT 'Figtree';

UPDATE "Store"
SET "displayFont" = CASE "fontPairing"::text
  WHEN 'CLASSIC' THEN 'Libre-Baskerville'
  WHEN 'EDITORIAL' THEN 'DM-Serif-Display'
  ELSE 'Figtree'
END,
"bodyFont" = CASE "fontPairing"::text
  WHEN 'CLASSIC' THEN 'Source-Sans-3'
  WHEN 'EDITORIAL' THEN 'DM-Sans'
  ELSE 'Figtree'
END
WHERE EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'Store' AND column_name = 'fontPairing'
);

ALTER TABLE "Store" DROP COLUMN IF EXISTS "fontPairing";

DROP TYPE IF EXISTS "FontPairing";
