-- CreateEnum
CREATE TYPE "WorkflowEntityType" AS ENUM ('REQUISITION', 'APPLICATION');

-- CreateEnum
CREATE TYPE "RequisitionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('JD', 'EMAIL', 'OFFER_LETTER');

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entityType" "WorkflowEntityType" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_stages" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isInitial" BOOLEAN NOT NULL DEFAULT false,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "slaHours" INTEGER,

    CONSTRAINT "workflow_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_transitions" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "fromStageId" TEXT,
    "toStageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guardKey" TEXT,
    "requiresApprovalRole" "UserRole",
    "actionKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedFromAnyStage" BOOLEAN NOT NULL DEFAULT false,
    "reasonCodeRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "workflow_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "state_transition_events" (
    "id" TEXT NOT NULL,
    "entityType" "WorkflowEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "applicationId" TEXT,
    "requisitionId" TEXT,
    "fromStageId" TEXT,
    "toStageId" TEXT NOT NULL,
    "transitionId" TEXT,
    "actorId" TEXT NOT NULL,
    "actorRole" "UserRole" NOT NULL,
    "reasonCode" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "state_transition_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisitions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "locations" TEXT[],
    "headcount" INTEGER NOT NULL DEFAULT 1,
    "budgetMin" MONEY,
    "budgetMax" MONEY,
    "priority" "RequisitionPriority" NOT NULL DEFAULT 'MEDIUM',
    "targetOnboardDate" TIMESTAMP(3),
    "currentStageId" TEXT,
    "workflowId" TEXT NOT NULL,
    "jdTemplateId" TEXT,
    "jdSnapshot" TEXT,
    "recruiterOwnerId" TEXT NOT NULL,
    "hiringManagerId" TEXT NOT NULL,
    "clonedFromId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisition_skills" (
    "id" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "skillNodeId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "minProficiency" TEXT,

    CONSTRAINT "requisition_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "type" "TemplateType" NOT NULL,
    "name" TEXT NOT NULL,
    "roleFamily" TEXT,
    "region" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "body" TEXT NOT NULL,
    "mergeFields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "supersedesId" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_stages_workflowId_key_key" ON "workflow_stages"("workflowId", "key");

-- CreateIndex
CREATE INDEX "workflow_transitions_workflowId_fromStageId_idx" ON "workflow_transitions"("workflowId", "fromStageId");

-- CreateIndex
CREATE INDEX "state_transition_events_entityType_entityId_occurredAt_idx" ON "state_transition_events"("entityType", "entityId", "occurredAt");

-- CreateIndex
CREATE INDEX "state_transition_events_requisitionId_occurredAt_idx" ON "state_transition_events"("requisitionId", "occurredAt");

-- CreateIndex
CREATE INDEX "state_transition_events_actorId_occurredAt_idx" ON "state_transition_events"("actorId", "occurredAt");

-- CreateIndex
CREATE INDEX "state_transition_events_toStageId_occurredAt_idx" ON "state_transition_events"("toStageId", "occurredAt");

-- CreateIndex
CREATE INDEX "requisitions_recruiterOwnerId_idx" ON "requisitions"("recruiterOwnerId");

-- CreateIndex
CREATE INDEX "requisitions_hiringManagerId_idx" ON "requisitions"("hiringManagerId");

-- CreateIndex
CREATE UNIQUE INDEX "requisition_skills_requisitionId_skillNodeId_key" ON "requisition_skills"("requisitionId", "skillNodeId");

-- CreateIndex
CREATE INDEX "templates_type_name_idx" ON "templates"("type", "name");

-- AddForeignKey
ALTER TABLE "workflow_stages" ADD CONSTRAINT "workflow_stages_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "workflow_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "workflow_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "state_transition_events" ADD CONSTRAINT "state_transition_events_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "state_transition_events" ADD CONSTRAINT "state_transition_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "workflow_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_jdTemplateId_fkey" FOREIGN KEY ("jdTemplateId") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_recruiterOwnerId_fkey" FOREIGN KEY ("recruiterOwnerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_hiringManagerId_fkey" FOREIGN KEY ("hiringManagerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_clonedFromId_fkey" FOREIGN KEY ("clonedFromId") REFERENCES "requisitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_skills" ADD CONSTRAINT "requisition_skills_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_skills" ADD CONSTRAINT "requisition_skills_skillNodeId_fkey" FOREIGN KEY ("skillNodeId") REFERENCES "skill_taxonomy_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
