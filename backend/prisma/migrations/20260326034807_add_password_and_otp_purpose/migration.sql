-- AlterTable
ALTER TABLE "OtpVerification" ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'register';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;
