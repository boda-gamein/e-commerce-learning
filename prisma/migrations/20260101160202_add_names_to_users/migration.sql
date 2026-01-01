-- AlterTable
ALTER TABLE "users" ADD COLUMN     "first_name" TEXT NOT NULL DEFAULT 'first_name',
ADD COLUMN     "last_name" TEXT NOT NULL DEFAULT 'last_name';
