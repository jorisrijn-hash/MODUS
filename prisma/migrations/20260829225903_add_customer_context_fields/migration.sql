-- AlterTable
ALTER TABLE "Diagnostic" ADD COLUMN "pricingFactors" TEXT;
ALTER TABLE "Diagnostic" ADD COLUMN "contextToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Diagnostic_contextToken_key" ON "Diagnostic"("contextToken");
