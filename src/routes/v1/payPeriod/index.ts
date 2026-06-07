import { Router } from 'express';
import getPayPeriodsRouter from './getPayPeriods.js';
import getNextPayPeriodRouter from './getNextPayPeriod.js';
import getPayPeriodByIdRouter from './getPayPeriodById.js';
import postPayPeriodRouter from './postPayPeriod.js';
import putPayPeriodRouter from './putPayPeriod.js';

const router = Router();

router.use(getNextPayPeriodRouter);
router.use(getPayPeriodsRouter);
router.use(getPayPeriodByIdRouter);
router.use(postPayPeriodRouter);
router.use(putPayPeriodRouter);

export default router;
