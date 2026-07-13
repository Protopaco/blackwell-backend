import { Router, Request, Response } from 'express';
import getEmployeesService from '#services/employee/getEmployees.js';
import { logger } from '#utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/v1/employee/{clientId}:
 *   get:
 *     operationId: v1GetEmployees
 *     summary: Get all employees for a client
 *     tags:
 *       - Employee
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Client not found
 */
router.get('/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`GET /employee/${clientId} — request`);

  const employees = await getEmployeesService(clientId);

  logger.info(`GET /employee/${clientId} — response 200 count=${employees.length}`);
  return res.status(200).json(employees);
});

export default router;
