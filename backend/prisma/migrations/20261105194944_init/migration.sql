-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COORDINADOR', 'EVALUADOR', 'DOCENTE');

-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('CUALITATIVO', 'CUANTITATIVO');

-- CreateEnum
CREATE TYPE "VerificationMode" AS ENUM ('DOCUMENTAL', 'PRESENCIAL');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('CARGADO', 'VALIDADO', 'OBSERVADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('VERIFICADA', 'CON_OBSERVACIONES');

-- CreateEnum
CREATE TYPE "IndicatorRating" AS ENUM ('SATISFACTORIO', 'CUASI_SATISFACTORIO', 'POCO_SATISFACTORIO', 'DEFICIENTE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicPeriod" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Criterion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "Criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCriterion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "criterionId" TEXT NOT NULL,

    CONSTRAINT "SubCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "IndicatorType" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "subCriterionId" TEXT NOT NULL,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "mode" "VerificationMode" NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceVersion" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'CARGADO',
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "note" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,
    "legacyId" TEXT,

    CONSTRAINT "EvidenceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceReview" (
    "id" TEXT NOT NULL,
    "evidenceVersionId" TEXT NOT NULL,
    "status" "EvidenceStatus" NOT NULL,
    "comment" TEXT,
    "reviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentialVerification" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "result" "VerificationResult" NOT NULL,
    "notes" TEXT NOT NULL,
    "verifiedById" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "legacyId" TEXT,

    CONSTRAINT "PresentialVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicatorAssessment" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "rating" "IndicatorRating" NOT NULL,
    "score" DECIMAL(3,2) NOT NULL,
    "achievements" TEXT NOT NULL,
    "deficiencies" TEXT NOT NULL,
    "assessedById" TEXT NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "legacyId" TEXT,

    CONSTRAINT "IndicatorAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "periodId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicPeriod_code_key" ON "AcademicPeriod"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Criterion_code_key" ON "Criterion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SubCriterion_code_key" ON "SubCriterion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_code_key" ON "Indicator"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Requirement_indicatorId_number_key" ON "Requirement"("indicatorId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceVersion_storageKey_key" ON "EvidenceVersion"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceVersion_legacyId_key" ON "EvidenceVersion"("legacyId");

-- CreateIndex
CREATE INDEX "EvidenceVersion_periodId_requirementId_idx" ON "EvidenceVersion"("periodId", "requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceVersion_periodId_requirementId_version_key" ON "EvidenceVersion"("periodId", "requirementId", "version");

-- CreateIndex
CREATE INDEX "EvidenceReview_evidenceVersionId_idx" ON "EvidenceReview"("evidenceVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "PresentialVerification_legacyId_key" ON "PresentialVerification"("legacyId");

-- CreateIndex
CREATE INDEX "PresentialVerification_periodId_requirementId_idx" ON "PresentialVerification"("periodId", "requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorAssessment_legacyId_key" ON "IndicatorAssessment"("legacyId");

-- CreateIndex
CREATE INDEX "IndicatorAssessment_periodId_indicatorId_idx" ON "IndicatorAssessment"("periodId", "indicatorId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_createdAt_idx" ON "Notification"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "SubCriterion" ADD CONSTRAINT "SubCriterion_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "Criterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_subCriterionId_fkey" FOREIGN KEY ("subCriterionId") REFERENCES "SubCriterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceVersion" ADD CONSTRAINT "EvidenceVersion_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "AcademicPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceVersion" ADD CONSTRAINT "EvidenceVersion_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceVersion" ADD CONSTRAINT "EvidenceVersion_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceVersion" ADD CONSTRAINT "EvidenceVersion_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceReview" ADD CONSTRAINT "EvidenceReview_evidenceVersionId_fkey" FOREIGN KEY ("evidenceVersionId") REFERENCES "EvidenceVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceReview" ADD CONSTRAINT "EvidenceReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentialVerification" ADD CONSTRAINT "PresentialVerification_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "AcademicPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentialVerification" ADD CONSTRAINT "PresentialVerification_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentialVerification" ADD CONSTRAINT "PresentialVerification_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorAssessment" ADD CONSTRAINT "IndicatorAssessment_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "AcademicPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorAssessment" ADD CONSTRAINT "IndicatorAssessment_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorAssessment" ADD CONSTRAINT "IndicatorAssessment_assessedById_fkey" FOREIGN KEY ("assessedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Una sola version vigente (no eliminada) por periodo y requerimiento.
CREATE UNIQUE INDEX "EvidenceVersion_one_current_per_slot"
  ON "EvidenceVersion" ("periodId", "requirementId")
  WHERE "isCurrent" = true AND "deletedAt" IS NULL;

-- Una version eliminada nunca puede quedar como vigente.
ALTER TABLE "EvidenceVersion"
  ADD CONSTRAINT "EvidenceVersion_deleted_not_current"
  CHECK (NOT ("isCurrent" = true AND "deletedAt" IS NOT NULL));
