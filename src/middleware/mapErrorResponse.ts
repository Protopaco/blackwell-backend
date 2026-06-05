import { DatabaseError } from 'pg';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export default (err: unknown, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);

  if (err instanceof DatabaseError) {
    switch (err.code) {
      case '23505':
        return res.status(409).json({ error: 'db_error', message: 'Conflict: Duplicate entry' });
      case '23503':
        return res.status(400).json({ error: 'db_error', message: 'Bad Request: Foreign key violation' });
      case '23502':
        return res.status(400).json({ error: 'db_error', message: 'Bad Request: Not null violation' });
      default:
        return res.status(500).json({ error: 'db_error', message: 'Internal Server Error' });
    }
  }

  return res.status(500).json({ error: 'server_error', message: 'Internal Server Error' });
};
