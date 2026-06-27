import { Router } from 'express';
import getPayrollReportRouter from './getPayrollReport.js';
import postGeneratePayrollReportRouter from './postGeneratePayrollReport.js';

const router = Router();

router.use(getPayrollReportRouter);
router.use(postGeneratePayrollReportRouter);

export default router;
