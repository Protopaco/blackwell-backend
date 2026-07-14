import { Router } from 'express';
import getHolidaysRouter from './getHolidays.js';
import postHolidayRouter from './postHoliday.js';
import putHolidayRouter from './putHoliday.js';
import deleteHolidayRouter from './deleteHoliday.js';

const router = Router();

router.use(getHolidaysRouter);
router.use(postHolidayRouter);
router.use(putHolidayRouter);
router.use(deleteHolidayRouter);

export default router;
