/*
  Warnings:

  - You are about to drop the column `stripePaymentId` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalPaymentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalOrderId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "BalanceTransactionType" AS ENUM ('CREDIT', 'DEBIT', 'REFUND', 'FEE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RefundStatus" ADD VALUE 'APPROVED';
ALTER TYPE "RefundStatus" ADD VALUE 'REJECTED';

-- DropIndex
DROP INDEX "payments_stripePaymentId_idx";

-- DropIndex
DROP INDEX "payments_stripePaymentId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "stripePaymentId",
ADD COLUMN     "externalOrderId" TEXT,
ADD COLUMN     "externalPaymentId" TEXT,
ADD COLUMN     "gatewayProvider" TEXT DEFAULT 'MERCADOPAGO',
ADD COLUMN     "instructorAmount" DOUBLE PRECISION,
ADD COLUMN     "paymentData" TEXT,
ADD COLUMN     "paymentMethod" TEXT DEFAULT 'PIX',
ADD COLUMN     "platformFeeAmount" DOUBLE PRECISION,
ALTER COLUMN "currency" SET DEFAULT 'BRL';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "paymentAccountId" TEXT,
ADD COLUMN     "paymentCustomerId" TEXT,
ADD COLUMN     "payoutPreference" TEXT DEFAULT 'PIX',
ADD COLUMN     "pixKey" TEXT;

-- CreateTable
CREATE TABLE "instructor_balances" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "availableBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalWithdrawn" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructor_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_requests" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "bankAccountType" TEXT,
    "bankDetails" JSONB NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_transactions" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "type" "BalanceTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "paymentId" TEXT,
    "payoutRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instructor_balances_instructorId_key" ON "instructor_balances"("instructorId");

-- CreateIndex
CREATE INDEX "instructor_balances_instructorId_idx" ON "instructor_balances"("instructorId");

-- CreateIndex
CREATE INDEX "payout_requests_instructorId_idx" ON "payout_requests"("instructorId");

-- CreateIndex
CREATE INDEX "payout_requests_status_idx" ON "payout_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "balance_transactions_payoutRequestId_key" ON "balance_transactions"("payoutRequestId");

-- CreateIndex
CREATE INDEX "balance_transactions_instructorId_idx" ON "balance_transactions"("instructorId");

-- CreateIndex
CREATE INDEX "balance_transactions_type_idx" ON "balance_transactions"("type");

-- CreateIndex
CREATE INDEX "balance_transactions_paymentId_idx" ON "balance_transactions"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_externalPaymentId_key" ON "payments"("externalPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_externalOrderId_key" ON "payments"("externalOrderId");

-- CreateIndex
CREATE INDEX "payments_externalPaymentId_idx" ON "payments"("externalPaymentId");

-- CreateIndex
CREATE INDEX "payments_externalOrderId_idx" ON "payments"("externalOrderId");

-- CreateIndex
CREATE INDEX "payments_gatewayProvider_idx" ON "payments"("gatewayProvider");

-- AddForeignKey
ALTER TABLE "instructor_balances" ADD CONSTRAINT "instructor_balances_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructor_balances"("instructorId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_transactions" ADD CONSTRAINT "balance_transactions_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructor_balances"("instructorId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_transactions" ADD CONSTRAINT "balance_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_transactions" ADD CONSTRAINT "balance_transactions_payoutRequestId_fkey" FOREIGN KEY ("payoutRequestId") REFERENCES "payout_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
