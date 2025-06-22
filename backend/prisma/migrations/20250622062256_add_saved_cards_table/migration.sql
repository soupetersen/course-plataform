-- CreateTable
CREATE TABLE "saved_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardHolderName" TEXT NOT NULL,
    "cardNumberLast4" TEXT NOT NULL,
    "cardBrand" TEXT NOT NULL,
    "expirationMonth" TEXT NOT NULL,
    "expirationYear" TEXT NOT NULL,
    "identificationType" TEXT NOT NULL,
    "identificationNumber" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_cards_userId_idx" ON "saved_cards"("userId");

-- AddForeignKey
ALTER TABLE "saved_cards" ADD CONSTRAINT "saved_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
