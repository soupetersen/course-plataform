/*
  Warnings:

  - Added the required column `courseId` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT');

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPreview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "LessonType" NOT NULL DEFAULT 'VIDEO';

-- CreateIndex
CREATE INDEX "lessons_courseId_idx" ON "lessons"("courseId");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
