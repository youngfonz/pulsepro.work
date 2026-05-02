-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "slackBotToken" TEXT,
ADD COLUMN "slackInstalledAt" TIMESTAMP(3),
ADD COLUMN "slackTeamId" TEXT,
ADD COLUMN "slackUserId" TEXT;

-- CreateIndex
CREATE INDEX "Subscription_slackTeamId_slackUserId_idx" ON "Subscription"("slackTeamId", "slackUserId");
