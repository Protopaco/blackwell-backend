import { Router, Request, Response } from 'express';
import resetDevTestData from '#devTestData/resetDevTestData.js';
import { logger } from '#utils/logger.js';

const router = Router();

const postResetTestData = async (_req: Request, res: Response): Promise<Response> => {
  logger.info('POST /dev/testData/reset — request');

  await resetDevTestData();
  logger.info('POST /dev/testData/reset — response 200');
  return res.status(200).json({ message: 'Test data reset' });
};

router.post('/testData/reset', postResetTestData);

export default router;
export { postResetTestData };
