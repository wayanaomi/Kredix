-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "location" TEXT,
    "description" TEXT,
    "tenureMonths" INTEGER,
    "employeeCount" INTEGER,
    "registrationStatus" TEXT,
    "onboardingStep" TEXT NOT NULL DEFAULT 'BUSINESS_DETAILS',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Business" ("createdAt", "description", "employeeCount", "id", "industry", "location", "name", "onboardingStep", "ownerId", "registrationStatus", "tenureMonths", "updatedAt") SELECT "createdAt", "description", "employeeCount", "id", "industry", "location", "name", "onboardingStep", "ownerId", "registrationStatus", "tenureMonths", "updatedAt" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE INDEX "Business_ownerId_idx" ON "Business"("ownerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
