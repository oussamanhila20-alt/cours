-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "periodMonth" INTEGER;
ALTER TABLE "Payment" ADD COLUMN "periodYear" INTEGER;

UPDATE "Payment"
SET
  "periodMonth" = EXTRACT(MONTH FROM "paidAt")::INTEGER,
  "periodYear" = EXTRACT(YEAR FROM "paidAt")::INTEGER
WHERE "periodMonth" IS NULL OR "periodYear" IS NULL;

ALTER TABLE "Payment" ALTER COLUMN "periodMonth" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "periodYear" SET NOT NULL;

CREATE INDEX "Payment_periodYear_periodMonth_idx" ON "Payment"("periodYear", "periodMonth");
