/*
  Warnings:

  - You are about to drop the column `bankAccount` on the `users` table. All the data in the column will be lost.
  - The `payoutPreference` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[instructorId,requestMonth,requestYear]` on the table `payout_requests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `requestMonth` to the `payout_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestYear` to the `payout_requests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('PIX', 'BANK_TRANSFER', 'PAYPAL');

-- AlterTable
ALTER TABLE "payout_requests" ADD COLUMN     "requestMonth" INTEGER NOT NULL,
ADD COLUMN     "requestYear" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "questions" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "refund_requests" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "bankAccount",
ADD COLUMN     "bankData" JSONB,
ADD COLUMN     "documentNumber" TEXT,
ADD COLUMN     "documentType" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
DROP COLUMN "payoutPreference",
ADD COLUMN     "payoutPreference" "PayoutMethod" DEFAULT 'PIX';

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_resets_email_code_idx" ON "password_resets"("email", "code");

-- CreateIndex
CREATE INDEX "password_resets_expiresAt_idx" ON "password_resets"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "payout_requests_instructorId_requestMonth_requestYear_key" ON "payout_requests"("instructorId", "requestMonth", "requestYear");
