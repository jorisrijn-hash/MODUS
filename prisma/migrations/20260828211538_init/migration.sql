-- CreateTable
CREATE TABLE "Diagnostic" (
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
    "source" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosticId" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Admin',
    "body" TEXT NOT NULL,
    CONSTRAINT "Note_diagnosticId_fkey" FOREIGN KEY ("diagnosticId") REFERENCES "Diagnostic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosticId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    CONSTRAINT "ActivityEvent_diagnosticId_fkey" FOREIGN KEY ("diagnosticId") REFERENCES "Diagnostic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE INDEX "Diagnostic_status_idx" ON "Diagnostic"("status");

-- CreateIndex
CREATE INDEX "Diagnostic_createdAt_idx" ON "Diagnostic"("createdAt");

-- CreateIndex
CREATE INDEX "Diagnostic_email_idx" ON "Diagnostic"("email");

-- CreateIndex
CREATE INDEX "Note_diagnosticId_idx" ON "Note"("diagnosticId");

-- CreateIndex
CREATE INDEX "ActivityEvent_diagnosticId_idx" ON "ActivityEvent"("diagnosticId");

-- CreateIndex
CREATE INDEX "LoginAttempt_ip_createdAt_idx" ON "LoginAttempt"("ip", "createdAt");
