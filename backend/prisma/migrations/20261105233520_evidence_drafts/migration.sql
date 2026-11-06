-- CreateTable
CREATE TABLE "EvidenceDraft" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "requirementNumber" INTEGER NOT NULL,
    "requirementLabel" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "observations" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceDraft_periodId_indicatorId_requirementNumber_key" ON "EvidenceDraft"("periodId", "indicatorId", "requirementNumber");

-- AddForeignKey
ALTER TABLE "EvidenceDraft" ADD CONSTRAINT "EvidenceDraft_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "AcademicPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceDraft" ADD CONSTRAINT "EvidenceDraft_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceDraft" ADD CONSTRAINT "EvidenceDraft_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
