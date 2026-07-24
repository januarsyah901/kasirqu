-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "baseUnit" TEXT NOT NULL DEFAULT 'pcs',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "saleUnit" TEXT NOT NULL DEFAULT 'pcs',
ADD COLUMN     "unitsPerSale" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Settings" ALTER COLUMN "storeName" SET DEFAULT 'Sidomoro';
