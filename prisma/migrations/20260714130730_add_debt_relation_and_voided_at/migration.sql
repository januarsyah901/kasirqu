-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "voidedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
