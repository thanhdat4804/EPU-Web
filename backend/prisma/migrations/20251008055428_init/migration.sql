/*
  Warnings:

  - You are about to drop the `AttendInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Complaint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReExam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Registration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Submission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AttendInfo" DROP CONSTRAINT "AttendInfo_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AttendInfo" DROP CONSTRAINT "AttendInfo_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Class" DROP CONSTRAINT "Class_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Class" DROP CONSTRAINT "Class_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Complaint" DROP CONSTRAINT "Complaint_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Grade" DROP CONSTRAINT "Grade_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Grade" DROP CONSTRAINT "Grade_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notice" DROP CONSTRAINT "Notice_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReExam" DROP CONSTRAINT "ReExam_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReExam" DROP CONSTRAINT "ReExam_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Registration" DROP CONSTRAINT "Registration_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Submission" DROP CONSTRAINT "Submission_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Submission" DROP CONSTRAINT "Submission_studentId_fkey";

-- DropTable
DROP TABLE "public"."AttendInfo";

-- DropTable
DROP TABLE "public"."Class";

-- DropTable
DROP TABLE "public"."Complaint";

-- DropTable
DROP TABLE "public"."Course";

-- DropTable
DROP TABLE "public"."Grade";

-- DropTable
DROP TABLE "public"."Message";

-- DropTable
DROP TABLE "public"."Notice";

-- DropTable
DROP TABLE "public"."Payment";

-- DropTable
DROP TABLE "public"."ReExam";

-- DropTable
DROP TABLE "public"."Registration";

-- DropTable
DROP TABLE "public"."Schedule";

-- DropTable
DROP TABLE "public"."Submission";

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."AttendStatus";

-- DropEnum
DROP TYPE "public"."ComplaintStatus";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."ReExamStatus";

-- DropEnum
DROP TYPE "public"."Role";

-- DropEnum
DROP TYPE "public"."ScheduleType";
