import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { checkSlaBreaches } from './modules/notifications/sla.service';

const SLA_CHECK_INTERVAL_MS = 5 * 60 * 1000;

app.listen(env.PORT, () => {
  logger.info(`Talent Acquisition server listening on port ${env.PORT}`);

  checkSlaBreaches().catch((err) => logger.error('Initial SLA check failed', err));
  setInterval(() => {
    checkSlaBreaches().catch((err) => logger.error('Scheduled SLA check failed', err));
  }, SLA_CHECK_INTERVAL_MS);
});
