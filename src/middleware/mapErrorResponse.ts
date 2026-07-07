import { DatabaseError } from 'pg';
import { Request, Response, NextFunction } from 'express';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Express error handler that maps known errors to appropriate HTTP codes and returns a JSON body.
// Registered as the last middleware in app.ts so it catches unhandled errors from all routes.
export default (err: unknown, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);

  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: 'not_found', message: err.message });
  }

  if (err instanceof UnprocessableError) {
    return res.status(422).json({ error: 'unprocessable', message: err.message });
  }

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
