-- CreateEnum
CREATE TYPE "transactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "type" "transactionType" NOT NULL DEFAULT 'DEPOSIT';
