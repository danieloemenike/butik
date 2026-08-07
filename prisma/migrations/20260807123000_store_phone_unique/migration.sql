-- Deduplicate phone numbers before adding unique constraint (keep earliest store)
WITH ranked AS (
  SELECT id,
         "phoneNumber",
         ROW_NUMBER() OVER (PARTITION BY "phoneNumber" ORDER BY "createdAt" ASC) AS rn
  FROM "Store"
  WHERE "phoneNumber" IS NOT NULL
)
UPDATE "Store" AS s
SET "phoneNumber" = NULL
FROM ranked r
WHERE s.id = r.id AND r.rn > 1;

-- CreateIndex
CREATE UNIQUE INDEX "Store_phoneNumber_key" ON "Store"("phoneNumber");
