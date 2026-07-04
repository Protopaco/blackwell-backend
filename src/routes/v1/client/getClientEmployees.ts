import { Router, Request, Response } from "express";
import getEmployeesService from "#services/employee/getEmployees.js";
import Employee from "#models/Employee.js";
import { logger } from "#utils/logger.js";

const router = Router();

/**
 * @swagger
 * /api/v1/client/{clientId}/employees:
 *   get:
 *     operationId: v1GetClientEmployees
 *     summary: Get all employees for a client
 *     tags:
 *       - Client
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
 */
router.get("/:clientId/employees", async (req: Request, res: Response) => {
  const { clientId } = req.params as { clientId: string };
  logger.info(`GET /client/${clientId}/employees — request`);
  const employees = (await getEmployeesService(clientId)) as Employee[];
  logger.info(
    `GET /client/${clientId}/employees — response 200 count=${employees.length}`,
  );
  res.status(200).json(employees);
});

export default router;
