-- CreateEnum
CREATE TYPE "UserOutletStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- AlterTable
ALTER TABLE "UserOutlet"
ADD COLUMN "status" "UserOutletStatus" NOT NULL DEFAULT 'CONFIRMED';

-- Data migration: existing memberships were already active before status tracking
UPDATE "UserOutlet" SET "status" = 'CONFIRMED';

-- New DMS-inserted memberships should start pending after the backfill
ALTER TABLE "UserOutlet" ALTER COLUMN "status" SET DEFAULT 'PENDING';
