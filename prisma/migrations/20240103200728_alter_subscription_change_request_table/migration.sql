/*
  Warnings:

  - Changed the type of `requested_action` on the `SubscriptionChangeRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SubscriptionChangeRequest" DROP COLUMN "requested_action",
ADD COLUMN     "requested_action" INTEGER NOT NULL;
