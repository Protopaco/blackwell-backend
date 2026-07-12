import { Router, Request, Response } from 'express';
import getAllocationReportService from '#services/payrollReport/getAllocationReport.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/payrollReport/{clientId}/{payPeriodId}/allocationReport:
 *   get:
 *     operationId: v1GetAllocationReport
 *     summary: Get the allocation report for a pay period
 *     tags:
 *       - PayrollReport
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: payPeriodId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Allocation report rows, one per funding source. Empty array if report has not been generated yet.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AllocationReportRow'
 *       404:
 *         description: Client or pay period not found
 */
router.get('/:clientId/:payPeriodId/allocationReport', async (req: Request, res: Response) => {
  const { clientId, payPeriodId } = req.params as { clientId: string; payPeriodId: string };
  logger.info(`GET /payrollReport/${clientId}/${payPeriodId}/allocationReport — request`);

  const rows = await getAllocationReportService(clientId, payPeriodId);

  logger.info(`GET /payrollReport/${clientId}/${payPeriodId}/allocationReport — response 200 count=${rows.length}`);
  return res.status(200).json(rows);
});

export default router;
