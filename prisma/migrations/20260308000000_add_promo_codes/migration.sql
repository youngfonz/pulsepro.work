-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoRedemption" (
    "id" TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoRedemption_userId_idx" ON "PromoRedemption"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoRedemption_promoCodeId_userId_key" ON "PromoRedemption"("promoCodeId", "userId");

-- AddForeignKey
ALTER TABLE "PromoRedemption" ADD CONSTRAINT "PromoRedemption_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
