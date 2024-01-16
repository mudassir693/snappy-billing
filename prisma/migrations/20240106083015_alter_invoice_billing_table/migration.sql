/*
  Warnings:

  - A unique constraint covering the columns `[invoice_number]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "kitchen_id" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_id" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "invoice_number" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_number_key" ON "Invoice"("invoice_number");
