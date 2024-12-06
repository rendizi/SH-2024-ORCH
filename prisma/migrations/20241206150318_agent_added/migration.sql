-- CreateTable
CREATE TABLE "Agent" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastActive" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);
