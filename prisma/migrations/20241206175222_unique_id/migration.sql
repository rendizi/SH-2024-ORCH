/*
  Warnings:

  - A unique constraint covering the columns `[vulnerability_id]` on the table `Exploit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Exploit_vulnerability_id_key" ON "Exploit"("vulnerability_id");
