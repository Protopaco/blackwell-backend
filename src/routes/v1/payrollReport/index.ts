import { Router } from 'express';
import postGeneratePayrollReportRouter from './postGeneratePayrollReport.js';

const router = Router();

router.use(postGeneratePayrollReportRouter);

export default router;
