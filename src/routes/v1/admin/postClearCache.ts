import { Router, Request, Response } from 'express';
import { clearClientsCache } from '#db/client/readClients.js';
import { clearPayrollConfigCache } from '#db/payrollConfig/readPayrollConfig.js';
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
  clearClientsCache();
  clearPayrollConfigCache();
  logger.info('POST /admin/cache/clear — all caches cleared');
  return res.status(200).json({ message: 'Cache cleared' });
});

export default router;
