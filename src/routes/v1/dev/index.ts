import { Router } from 'express';
import postPurgeTestDataRouter from './postPurgeTestData.js';

const router = Router();

router.use(postPurgeTestDataRouter);

export default router;
