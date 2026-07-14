import { Router } from 'express';
import getActivitiesRouter from './getActivities.js';
import postActivityRouter from './postActivity.js';
import putActivityRouter from './putActivity.js';
import deleteActivityRouter from './deleteActivity.js';

const router = Router();

router.use(getActivitiesRouter);
router.use(postActivityRouter);
router.use(putActivityRouter);
router.use(deleteActivityRouter);

export default router;
