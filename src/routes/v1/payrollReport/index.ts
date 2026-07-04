import { Router } from 'express';
import getPayrollReportRouter from './getPayrollReport.js';
import postGeneratePayrollReportRouter from './postGeneratePayrollReport.js';
import getEmployeeExpensesRouter from './getEmployeeExpenses.js';
import putEmployeeExpensesRouter from './putEmployeeExpenses.js';

const router = Router();

router.use(getPayrollReportRouter);
router.use(postGeneratePayrollReportRouter);
router.use(getEmployeeExpensesRouter);
router.use(putEmployeeExpensesRouter);

export default router;
