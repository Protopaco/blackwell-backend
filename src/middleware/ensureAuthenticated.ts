import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    logger.debug(req.user, 'Authenticated access granted');
    return next();
  }
  logger.debug('Unauthenticated access attempt');
  return res.status(401).end();
};
