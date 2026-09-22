import { NotificationType } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { getAgingReport } from '../reporting/reporting.service';
import { createNotification } from './notification.service';

/**
 * Compares each active application's time-in-current-stage against its
 * stage's configured slaHours (via the same window-function aging report
 * the reporting dashboards use) and creates one SLA_BREACH notification per
 * breach, deduped by checking for an existing notification with the same
 * applicationId in its payload so repeated runs don't spam.
 */
export async function checkSlaBreaches() {
  const aging = await getAgingReport();
  const breaches = aging.filter((a) => a.breached);

  let created = 0;
  for (const b of breaches) {
    const application = await prisma.application.findUnique({
      where: { id: b.applicationId },
      include: { requisition: true },
    });
    if (!application) continue;

    const alreadyNotified = await prisma.notification.findFirst({
      where: {
        userId: application.requisition.recruiterOwnerId,
        type: NotificationType.SLA_BREACH,
        payload: { path: ['applicationId'], equals: b.applicationId },
      },
    });
    if (alreadyNotified) continue;

    const hours = Math.round(b.hoursInStage);
    await createNotification(
      application.requisition.recruiterOwnerId,
      NotificationType.SLA_BREACH,
      { applicationId: b.applicationId, stageLabel: b.stageLabel, hoursInStage: hours, slaHours: b.slaHours },
      {
        subject: `SLA breach: ${b.candidateName} in ${b.stageLabel}`,
        text: `${b.candidateName} has been in ${b.stageLabel} for ${hours}h, exceeding the ${b.slaHours}h SLA for this stage.`,
      },
    );
    created += 1;
  }

  return { checked: aging.length, breaches: breaches.length, notificationsCreated: created };
}
