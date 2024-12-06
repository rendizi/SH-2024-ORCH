/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Step` table. All the data in the column will be lost.
  - Added the required column `ranAt` to the `Step` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Step" DROP COLUMN "createdAt",
ADD COLUMN     "ranAt" TIMESTAMP(3) NOT NULL;
