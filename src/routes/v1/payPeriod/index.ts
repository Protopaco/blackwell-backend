import { Router } from 'express';
import getPayPeriodsRouter from './getPayPeriods.js';
import getNextPayPeriodRouter from './getNextPayPeriod.js';
import getPayPeriodByIdRouter from './getPayPeriodById.js';
import postPayPeriodRouter from './postPayPeriod.js';
import patchClosePayPeriodRouter from './patchClosePayPeriod.js';

const router = Router();

// getNextPayPeriodRouter (/:clientId/next) MUST be registered before getPayPeriodByIdRouter
// (/:clientId/:payPeriodId) — Express matches in registration order, and :payPeriodId is a wildcard
// that would otherwise swallow "next" as a literal ID.
router.use(getNextPayPeriodRouter);
router.use(getPayPeriodsRouter);
router.use(getPayPeriodByIdRouter);
router.use(postPayPeriodRouter);
router.use(patchClosePayPeriodRouter);

export default router;
