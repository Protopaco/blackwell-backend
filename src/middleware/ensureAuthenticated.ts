import { NextFunction, Request, Response } from 'express';
import 'passport';
import { logger } from '#utils/logger.js';

// Express middleware that blocks unauthenticated requests with 401 — applied to any routes that require a logged-in user.
export default (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    logger.debug(req.user, 'Authenticated access granted');
    return next();
  }
  logger.debug('Unauthenticated access attempt');
  return res.status(401).end();
};
