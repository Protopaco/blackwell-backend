import { Router, Request, Response } from 'express';
import clientsCache from '#utils/caches/clientsCache.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import payPeriodsCache from '#utils/caches/payPeriodsCache.js';
import currentHoursCache from '#utils/caches/currentHoursCache.js';
import employeeExpensesCache from '#utils/caches/employeeExpensesCache.js';
import additionalExpensesCache from '#utils/caches/additionalExpensesCache.js';
import allocationReportCache from '#utils/caches/allocationReportCache.js';
import timesheetDetailCache from '#utils/caches/timesheetDetailCache.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/admin/cache/clear:
 *   post:
 *     operationId: v1ClearCache
 *     summary: Clear all in-memory caches and force fresh reads from Google Sheets
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Cache cleared
 */
router.post('/cache/clear', (_req: Request, res: Response) => {
  clientsCache.clear();
  payrollConfigCache.clear();
  payPeriodsCache.clear();
  currentHoursCache.clear();
  employeeExpensesCache.clear();
  additionalExpensesCache.clear();
  allocationReportCache.clear();
  timesheetDetailCache.clear();
  logger.info('POST /admin/cache/clear — all caches cleared');
  return res.status(200).json({ message: 'Cache cleared' });
});

export default router;
