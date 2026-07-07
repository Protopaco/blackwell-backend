import { Router } from 'express';
import getPayrollReportRouter from './getPayrollReport.js';
import postGeneratePayrollReportRouter from './postGeneratePayrollReport.js';
import getEmployeeExpensesRouter from './getEmployeeExpenses.js';
import putEmployeeExpensesRouter from './putEmployeeExpenses.js';
import getAdditionalExpensesRouter from './getAdditionalExpenses.js';
import putAdditionalExpensesRouter from './putAdditionalExpenses.js';
import getAllocationReportRouter from './getAllocationReport.js';
import postGenerateAllocationReportRouter from './postGenerateAllocationReport.js';

const router = Router();

router.use(getPayrollReportRouter);
router.use(postGeneratePayrollReportRouter);
router.use(getEmployeeExpensesRouter);
router.use(putEmployeeExpensesRouter);
router.use(getAdditionalExpensesRouter);
router.use(putAdditionalExpensesRouter);
router.use(getAllocationReportRouter);
router.use(postGenerateAllocationReportRouter);

export default router;
