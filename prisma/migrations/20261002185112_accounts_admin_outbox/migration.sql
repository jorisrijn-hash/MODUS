-- AlterTable
ALTER TABLE "Diagnostic" ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "lifecycle" TEXT NOT NULL DEFAULT 'SUBMITTED',
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "schemaVersion" TEXT NOT NULL DEFAULT 'v1';

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "companyName" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "AdminMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientEntitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ClientEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationOutbox" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kind" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3),

    CONSTRAINT "NotificationOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestClaimToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenHash" TEXT NOT NULL,
    "diagnosticId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "consumedBy" TEXT,

    CONSTRAINT "GuestClaimToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "subjectId" TEXT,
    "detail" TEXT,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Profile_email_idx" ON "Profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminMember_userId_key" ON "AdminMember"("userId");

-- CreateIndex
CREATE INDEX "AdminMember_userId_idx" ON "AdminMember"("userId");

-- CreateIndex
CREATE INDEX "ClientEntitlement_userId_idx" ON "ClientEntitlement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientEntitlement_userId_scope_key" ON "ClientEntitlement"("userId", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationOutbox_dedupeKey_key" ON "NotificationOutbox"("dedupeKey");

-- CreateIndex
CREATE INDEX "NotificationOutbox_status_nextAttemptAt_idx" ON "NotificationOutbox"("status", "nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuestClaimToken_tokenHash_key" ON "GuestClaimToken"("tokenHash");

-- CreateIndex
CREATE INDEX "GuestClaimToken_diagnosticId_idx" ON "GuestClaimToken"("diagnosticId");

-- CreateIndex
CREATE INDEX "GuestClaimToken_expiresAt_idx" ON "GuestClaimToken"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorId_idx" ON "AuditEvent"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnostic_idempotencyKey_key" ON "Diagnostic"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Diagnostic_ownerId_idx" ON "Diagnostic"("ownerId");

-- CreateIndex
CREATE INDEX "Diagnostic_lifecycle_idx" ON "Diagnostic"("lifecycle");

