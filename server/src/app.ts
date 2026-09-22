import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { skillTaxonomyRouter } from './modules/skillTaxonomy/skillTaxonomy.routes';
import { workflowRouter } from './modules/workflow/workflow.routes';
import { templatesRouter } from './modules/templates/templates.routes';
import { requisitionsRouter } from './modules/requisitions/requisitions.routes';
import { candidatesRouter } from './modules/candidates/candidates.routes';
import { applicationsRouter } from './modules/applications/applications.routes';
import { interviewsRouter } from './modules/interviews/interviews.routes';
import { offersRouter } from './modules/offers/offers.routes';
import { eventsRouter } from './modules/events/events.routes';
import { reportingRouter } from './modules/reporting/reporting.routes';
import { commentsRouter } from './modules/comments/comments.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/skill-taxonomy', skillTaxonomyRouter);
app.use('/api/workflows', workflowRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/requisitions', requisitionsRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/reporting', reportingRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/notifications', notificationsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);
