import { Router } from 'express';
import getPayrollReportRouter from './getPayrollReport.js';
import postGeneratePayrollReportRouter from './postGeneratePayrollReport.js';
import getEmployeeExpensesRouter from './getEmployeeExpenses.js';
import putEmployeeExpensesRouter from './putEmployeeExpenses.js';
import getAdditionalExpensesRouter from './getAdditionalExpenses.js';
import putAdditionalExpensesRouter from './putAdditionalExpenses.js';

const router = Router();

router.use(getPayrollReportRouter);
router.use(postGeneratePayrollReportRouter);
router.use(getEmployeeExpensesRouter);
router.use(putEmployeeExpensesRouter);
router.use(getAdditionalExpensesRouter);
router.use(putAdditionalExpensesRouter);

export default router;
