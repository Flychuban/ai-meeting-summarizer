/*
  Warnings:

  - Added the required column `date` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MeetingToParticipant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MeetingToParticipant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MeetingToParticipant_B_index" ON "_MeetingToParticipant"("B");

-- AddForeignKey
ALTER TABLE "_MeetingToParticipant" ADD CONSTRAINT "_MeetingToParticipant_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MeetingToParticipant" ADD CONSTRAINT "_MeetingToParticipant_B_fkey" FOREIGN KEY ("B") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
