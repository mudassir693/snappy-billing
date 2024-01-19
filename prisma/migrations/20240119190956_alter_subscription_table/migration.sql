/*
  Warnings:

  - Added the required column `account_id` to the `SnappySubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SnappySubscription" ADD COLUMN     "account_id" INTEGER NOT NULL;
