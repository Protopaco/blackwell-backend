import { Router } from 'express';
import postResetTestDataRouter from './postResetTestData.js';

const router = Router();

router.use(postResetTestDataRouter);

export default router;
