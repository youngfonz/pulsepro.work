-- AlterTable
ALTER TABLE "TaskComment" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "TaskComment_userId_idx" ON "TaskComment"("userId");
