import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     operationId: v1Health
 *     summary: Health check
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
