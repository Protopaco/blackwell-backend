import { Router, Request, Response } from 'express';
import purgeDevTestData from '#devTestData/purgeDevTestData.js';
import { logger } from '#utils/logger.js';

const router = Router();
const DEV_TOOL_KEY_HEADER = 'x-dev-tool-key';

const isQaEnvironment = (): boolean => process.env.NODE_ENV === 'qa';

const isAuthorized = (req: Request, res: Response): boolean => {
  if (!isQaEnvironment()) return true;

  const configuredKey = process.env.DEV_TOOL_KEY;
  if (!configuredKey) {
    logger.error('DEV_TOOL_KEY is not configured for QA dev test-data purge');
    res.status(500).json({ message: 'DEV_TOOL_KEY is not configured' });
    return false;
  }

  if (req.header(DEV_TOOL_KEY_HEADER) !== configuredKey) {
    logger.warn('Unauthorized dev test-data purge attempt');
    res.status(401).json({ message: 'Unauthorized' });
    return false;
  }

  return true;
};

const postPurgeTestData = async (req: Request, res: Response): Promise<Response | void> => {
  logger.info('POST /dev/test-data/purge — request');

  if (!isAuthorized(req, res)) return;

  const result = await purgeDevTestData();
  logger.info({ result }, 'POST /dev/test-data/purge — response 200');
  return res.status(200).json(result);
};

router.post('/test-data/purge', postPurgeTestData);

export default router;
export { postPurgeTestData };
