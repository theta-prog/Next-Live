/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `Memory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "shareEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "sharedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Memory_shareToken_key" ON "Memory"("shareToken");
