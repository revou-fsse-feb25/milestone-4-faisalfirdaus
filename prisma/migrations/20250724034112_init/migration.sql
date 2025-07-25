/*
  Warnings:

  - You are about to drop the column `account_no` on the `Account` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('SAVINGS', 'CHECKING', 'BUSINESS', 'CREDIT');

-- DropIndex
DROP INDEX "Account_account_no_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "account_no",
DROP COLUMN "type",
ADD COLUMN     "type" "AccountType" NOT NULL;
