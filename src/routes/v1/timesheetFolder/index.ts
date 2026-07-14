import { Router } from 'express';
import getTimesheetFoldersRouter from './getTimesheetFolders.js';
import postTimesheetFolderRouter from './postTimesheetFolder.js';
import putTimesheetFolderRouter from './putTimesheetFolder.js';

const router = Router();

router.use(getTimesheetFoldersRouter);
router.use(postTimesheetFolderRouter);
router.use(putTimesheetFolderRouter);

export default router;
