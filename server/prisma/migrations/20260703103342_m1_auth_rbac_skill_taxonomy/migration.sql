-- CreateEnum
CREATE TYPE "SkillNodeType" AS ENUM ('CATEGORY', 'SKILL', 'PROFICIENCY_LEVEL');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "managerId" TEXT;

-- CreateTable
CREATE TABLE "skill_taxonomy_nodes" (
    "id" TEXT NOT NULL,
    "type" "SkillNodeType" NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_taxonomy_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "skill_taxonomy_nodes_parentId_idx" ON "skill_taxonomy_nodes"("parentId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_taxonomy_nodes" ADD CONSTRAINT "skill_taxonomy_nodes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "skill_taxonomy_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
