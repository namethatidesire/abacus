-- AlterTable
ALTER TABLE "Event" ADD COLUMN "difficulty" INTEGER;
ALTER TABLE "Event" ADD COLUMN "estimatedTime" INTEGER;

-- CreateTable
CREATE TABLE "TaskEstimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "multiplier1" DECIMAL NOT NULL DEFAULT 1.0,
    "multiplier2" DECIMAL NOT NULL DEFAULT 1.0,
    "multiplier3" DECIMAL NOT NULL DEFAULT 1.0,
    "multiplier4" DECIMAL NOT NULL DEFAULT 1.0,
    "multiplier5" DECIMAL NOT NULL DEFAULT 1.0,
    "divider1" INTEGER NOT NULL DEFAULT 0,
    "divider2" INTEGER NOT NULL DEFAULT 0,
    "divider3" INTEGER NOT NULL DEFAULT 0,
    "divider4" INTEGER NOT NULL DEFAULT 0,
    "divider5" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TaskEstimate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
