/*
  Warnings:

  - Added the required column `command` to the `Step` table without a default value. This is not possible if the table is not empty.
  - Added the required column `output` to the `Step` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Step" ADD COLUMN     "command" TEXT NOT NULL,
ADD COLUMN     "output" TEXT NOT NULL;
