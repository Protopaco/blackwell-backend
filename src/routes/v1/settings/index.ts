import { Router } from 'express';
import getSettingsRouter from './getSettings.js';
import putSettingsRouter from './putSettings.js';

const router = Router();

router.use(getSettingsRouter);
router.use(putSettingsRouter);

export default router;
