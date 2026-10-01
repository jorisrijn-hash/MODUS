-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Diagnostic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "statusUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT NOT NULL,
    "employees" TEXT NOT NULL,
    "locations" TEXT NOT NULL,
    "revenueRange" TEXT,
    "customerChannels" TEXT NOT NULL,
    "enquiryHandling" TEXT NOT NULL,
    "adminWorkload" TEXT NOT NULL,
    "processStandardization" INTEGER NOT NULL,
    "keyEmployeeDependency" TEXT NOT NULL,
    "systems" TEXT NOT NULL,
    "systemConnectivity" TEXT NOT NULL,
    "spreadsheetDependency" TEXT NOT NULL,
    "automationUsage" TEXT NOT NULL,
    "frictionAreas" TEXT NOT NULL,
    "primaryPainPoint" TEXT NOT NULL,
    "problemDescription" TEXT NOT NULL,
    "problemFrequency" TEXT NOT NULL,
    "impactAreas" TEXT NOT NULL,
    "priorities" TEXT NOT NULL,
    "timing" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT,
    "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
    "preliminaryProfile" TEXT NOT NULL,
    "preliminarySignals" TEXT NOT NULL,
    "pricingVersion" TEXT,
    "complexityScoreTotal" INTEGER,
    "pricingBand" TEXT,
    "implementationScope" TEXT,
    "calculatedEstimateMin" INTEGER,
    "calculatedEstimateMax" INTEGER,
    "manualScopeRequired" BOOLEAN NOT NULL DEFAULT false,
    "pricingReasoning" TEXT,
    "reviewedEstimateMin" INTEGER,
    "reviewedEstimateMax" INTEGER,
    "finalProposalAmount" INTEGER,
    "finalProposalNote" TEXT,
    "source" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT
);
INSERT INTO "new_Diagnostic" ("adminWorkload", "automationUsage", "companyName", "createdAt", "customerChannels", "email", "employees", "enquiryHandling", "firstName", "frictionAreas", "id", "impactAreas", "industry", "keyEmployeeDependency", "lastName", "locations", "phone", "preliminaryProfile", "preliminarySignals", "primaryPainPoint", "priorities", "privacyConsent", "problemDescription", "problemFrequency", "processStandardization", "referrer", "revenueRange", "role", "source", "spreadsheetDependency", "status", "statusUpdatedAt", "systemConnectivity", "systems", "timing", "updatedAt", "utmCampaign", "utmMedium", "utmSource", "website") SELECT "adminWorkload", "automationUsage", "companyName", "createdAt", "customerChannels", "email", "employees", "enquiryHandling", "firstName", "frictionAreas", "id", "impactAreas", "industry", "keyEmployeeDependency", "lastName", "locations", "phone", "preliminaryProfile", "preliminarySignals", "primaryPainPoint", "priorities", "privacyConsent", "problemDescription", "problemFrequency", "processStandardization", "referrer", "revenueRange", "role", "source", "spreadsheetDependency", "status", "statusUpdatedAt", "systemConnectivity", "systems", "timing", "updatedAt", "utmCampaign", "utmMedium", "utmSource", "website" FROM "Diagnostic";
DROP TABLE "Diagnostic";
ALTER TABLE "new_Diagnostic" RENAME TO "Diagnostic";
CREATE INDEX "Diagnostic_status_idx" ON "Diagnostic"("status");
CREATE INDEX "Diagnostic_createdAt_idx" ON "Diagnostic"("createdAt");
CREATE INDEX "Diagnostic_email_idx" ON "Diagnostic"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
