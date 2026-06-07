import { Router } from 'express';
import postGenerateTimesheetsRouter from './postGenerateTimesheets.js';
import getTimesheetStatusRouter from './getTimesheetStatus.js';

const router = Router();

router.use(postGenerateTimesheetsRouter);
router.use(getTimesheetStatusRouter);

export default router;
