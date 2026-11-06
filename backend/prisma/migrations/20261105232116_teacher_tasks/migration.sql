-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NUEVA', 'EN_PROGRESO', 'ENTREGADA');

-- CreateTable
CREATE TABLE "TeacherTask" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "evidenceLabel" TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'NUEVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherTask_periodId_assigneeId_idx" ON "TeacherTask"("periodId", "assigneeId");

-- AddForeignKey
ALTER TABLE "TeacherTask" ADD CONSTRAINT "TeacherTask_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "AcademicPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTask" ADD CONSTRAINT "TeacherTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTask" ADD CONSTRAINT "TeacherTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTask" ADD CONSTRAINT "TeacherTask_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
