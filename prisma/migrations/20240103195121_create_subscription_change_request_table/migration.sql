-- CreateTable
CREATE TABLE "SubscriptionChangeRequest" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "current_subscription_id" INTEGER NOT NULL,
    "request_subscription_id" INTEGER NOT NULL,
    "requested_action" TEXT NOT NULL,
    "change_processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "SubscriptionChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionChangeRequest_invoice_id_key" ON "SubscriptionChangeRequest"("invoice_id");

-- AddForeignKey
ALTER TABLE "SubscriptionChangeRequest" ADD CONSTRAINT "SubscriptionChangeRequest_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
