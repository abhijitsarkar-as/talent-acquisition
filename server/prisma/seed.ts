import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, SkillNodeType, WorkflowEntityType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUsers() {
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';

  const roster: { name: string; email: string; password: string; role: UserRole }[] = [
    { name: 'Ada Admin', email: seedAdminEmail, password: seedAdminPassword, role: UserRole.ADMIN },
    { name: 'Tara Lead', email: 'ta.lead@example.com', password: 'Password123!', role: UserRole.TA_LEAD },
    { name: 'Rita Recruiter', email: 'recruiter@example.com', password: 'Password123!', role: UserRole.RECRUITER },
    {
      name: 'Hank HiringManager',
      email: 'hiring.manager@example.com',
      password: 'Password123!',
      role: UserRole.HIRING_MANAGER,
    },
    {
      name: 'Ivy Interviewer',
      email: 'interviewer@example.com',
      password: 'Password123!',
      role: UserRole.INTERVIEWER,
    },
    { name: 'Hazel HRBP', email: 'hrbp@example.com', password: 'Password123!', role: UserRole.HRBP },
  ];

  const created: Record<string, { id: string }> = {};
  for (const person of roster) {
    const passwordHash = await bcrypt.hash(person.password, 10);
    const user = await prisma.user.upsert({
      where: { email: person.email },
      update: {},
      create: {
        name: person.name,
        email: person.email,
        passwordHash,
        role: person.role,
      },
    });
    created[person.role] = user;
    console.log(`[seed] user ${person.email} (${person.role})`);
  }

  // Recruiter and hiring manager report to the TA lead — exercises the
  // managerId rollup used by "TA lead sees team" reporting scope.
  await prisma.user.update({
    where: { id: created[UserRole.RECRUITER].id },
    data: { managerId: created[UserRole.TA_LEAD].id },
  });
}

async function seedSkillTaxonomy() {
  const categories: Record<string, { name: string; skills: string[] }> = {
    'Backend Engineering': { name: 'Backend Engineering', skills: ['Node.js', 'PostgreSQL', 'System Design'] },
    'Frontend Engineering': { name: 'Frontend Engineering', skills: ['React', 'TypeScript', 'CSS'] },
    Sales: { name: 'Sales', skills: ['Enterprise Sales', 'Negotiation'] },
  };

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  for (const category of Object.values(categories)) {
    const existingCategory = await prisma.skillTaxonomyNode.findFirst({
      where: { type: SkillNodeType.CATEGORY, name: category.name },
    });
    const categoryNode =
      existingCategory ??
      (await prisma.skillTaxonomyNode.create({
        data: { type: SkillNodeType.CATEGORY, name: category.name },
      }));

    for (const skillName of category.skills) {
      const existingSkill = await prisma.skillTaxonomyNode.findFirst({
        where: { type: SkillNodeType.SKILL, name: skillName, parentId: categoryNode.id },
      });
      const skillNode =
        existingSkill ??
        (await prisma.skillTaxonomyNode.create({
          data: { type: SkillNodeType.SKILL, name: skillName, parentId: categoryNode.id },
        }));

      for (const [i, level] of proficiencyLevels.entries()) {
        const existingLevel = await prisma.skillTaxonomyNode.findFirst({
          where: { type: SkillNodeType.PROFICIENCY_LEVEL, name: level, parentId: skillNode.id },
        });
        if (!existingLevel) {
          await prisma.skillTaxonomyNode.create({
            data: { type: SkillNodeType.PROFICIENCY_LEVEL, name: level, parentId: skillNode.id, sortOrder: i },
          });
        }
      }
    }
  }

  console.log('[seed] skill taxonomy: 3 categories x skills x 4 proficiency levels');
}

interface StageSeed {
  key: string;
  label: string;
  isInitial?: boolean;
  isTerminal?: boolean;
  slaHours?: number;
}

interface TransitionSeed {
  fromKey: string | null; // null => allowedFromAnyStage
  toKey: string;
  name: string;
  requiresApprovalRole?: UserRole;
  reasonCodeRequired?: boolean;
  guardKey?: string;
  actionKeys?: string[];
}

async function seedWorkflow(
  entityType: WorkflowEntityType,
  name: string,
  stageSeeds: StageSeed[],
  transitionSeeds: TransitionSeed[],
) {
  const existing = await prisma.workflowDefinition.findFirst({ where: { entityType, isDefault: true } });
  if (existing) {
    console.log(`[seed] default ${entityType} workflow already exists, skipping`);
    return;
  }

  const workflow = await prisma.workflowDefinition.create({
    data: { name, entityType, isDefault: true, isActive: true },
  });

  const stageByKey = new Map<string, { id: string }>();
  for (const [i, stage] of stageSeeds.entries()) {
    const created = await prisma.workflowStage.create({
      data: {
        workflowId: workflow.id,
        key: stage.key,
        label: stage.label,
        isInitial: stage.isInitial ?? false,
        isTerminal: stage.isTerminal ?? false,
        sortOrder: i,
        slaHours: stage.slaHours,
      },
    });
    stageByKey.set(stage.key, created);
  }

  for (const t of transitionSeeds) {
    const toStage = stageByKey.get(t.toKey);
    if (!toStage) throw new Error(`Unknown toKey "${t.toKey}" in workflow "${name}"`);
    const fromStage = t.fromKey ? stageByKey.get(t.fromKey) : null;

    await prisma.workflowTransition.create({
      data: {
        workflowId: workflow.id,
        fromStageId: fromStage?.id,
        toStageId: toStage.id,
        name: t.name,
        allowedFromAnyStage: t.fromKey === null,
        requiresApprovalRole: t.requiresApprovalRole,
        reasonCodeRequired: t.reasonCodeRequired ?? false,
        guardKey: t.guardKey,
        actionKeys: t.actionKeys ?? [],
      },
    });
  }

  console.log(`[seed] workflow "${name}" (${entityType}): ${stageSeeds.length} stages, ${transitionSeeds.length} transitions`);
}

async function seedWorkflows() {
  await seedWorkflow(
    WorkflowEntityType.REQUISITION,
    'Standard Requisition Approval',
    [
      { key: 'DRAFT', label: 'Draft', isInitial: true, slaHours: 48 },
      { key: 'PENDING_APPROVAL', label: 'Pending Approval', slaHours: 24 },
      { key: 'APPROVED', label: 'Approved', slaHours: 24 },
      { key: 'OPEN', label: 'Open' },
      { key: 'ON_HOLD', label: 'On Hold' },
      { key: 'FILLED', label: 'Filled', isTerminal: true },
      { key: 'CLOSED', label: 'Closed', isTerminal: true },
      { key: 'CANCELLED', label: 'Cancelled', isTerminal: true },
    ],
    [
      { fromKey: 'DRAFT', toKey: 'PENDING_APPROVAL', name: 'Submit for Approval' },
      { fromKey: 'PENDING_APPROVAL', toKey: 'DRAFT', name: 'Send Back', reasonCodeRequired: true },
      {
        fromKey: 'PENDING_APPROVAL',
        toKey: 'APPROVED',
        name: 'Approve',
        requiresApprovalRole: UserRole.TA_LEAD,
        actionKeys: ['NOTIFY:recruiter_owner'],
      },
      { fromKey: 'APPROVED', toKey: 'OPEN', name: 'Open Requisition' },
      { fromKey: 'OPEN', toKey: 'ON_HOLD', name: 'Put On Hold', reasonCodeRequired: true },
      { fromKey: 'ON_HOLD', toKey: 'OPEN', name: 'Resume' },
      { fromKey: 'OPEN', toKey: 'FILLED', name: 'Mark Filled' },
      { fromKey: null, toKey: 'CLOSED', name: 'Close', reasonCodeRequired: true },
      { fromKey: null, toKey: 'CANCELLED', name: 'Cancel', reasonCodeRequired: true },
    ],
  );

  await seedWorkflow(
    WorkflowEntityType.APPLICATION,
    'Standard Candidate Pipeline',
    [
      { key: 'APPLIED', label: 'Applied', isInitial: true },
      { key: 'SCREENING', label: 'Screening', slaHours: 72 },
      { key: 'PHONE_INTERVIEW', label: 'Phone Interview', slaHours: 120 },
      { key: 'ONSITE', label: 'Onsite', slaHours: 168 },
      { key: 'DEBRIEF', label: 'Debrief', slaHours: 48 },
      { key: 'OFFER', label: 'Offer', slaHours: 72 },
      { key: 'BACKGROUND_CHECK', label: 'Background Check', slaHours: 120 },
      { key: 'HIRED', label: 'Hired', isTerminal: true },
      { key: 'REJECTED', label: 'Rejected', isTerminal: true },
      { key: 'WITHDRAWN', label: 'Withdrawn', isTerminal: true },
    ],
    [
      { fromKey: 'APPLIED', toKey: 'SCREENING', name: 'Advance to Screening' },
      { fromKey: 'SCREENING', toKey: 'PHONE_INTERVIEW', name: 'Advance to Phone Interview' },
      { fromKey: 'PHONE_INTERVIEW', toKey: 'ONSITE', name: 'Advance to Onsite' },
      { fromKey: 'ONSITE', toKey: 'DEBRIEF', name: 'Advance to Debrief' },
      {
        fromKey: 'DEBRIEF',
        toKey: 'OFFER',
        name: 'Advance to Offer',
        guardKey: 'DEBRIEF_QUORUM_MET',
        actionKeys: ['NOTIFY:hiring_manager'],
      },
      { fromKey: 'OFFER', toKey: 'BACKGROUND_CHECK', name: 'Advance to Background Check' },
      { fromKey: 'BACKGROUND_CHECK', toKey: 'HIRED', name: 'Mark Hired' },
      { fromKey: null, toKey: 'REJECTED', name: 'Reject', reasonCodeRequired: true },
      { fromKey: null, toKey: 'WITHDRAWN', name: 'Withdraw', reasonCodeRequired: true },
    ],
  );
}

async function main() {
  await seedUsers();
  await seedSkillTaxonomy();
  await seedWorkflows();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
