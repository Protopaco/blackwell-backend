import { Router } from 'express';
import postClearCacheRouter from './postClearCache.js';

const router = Router();

router.use(postClearCacheRouter);

export default router;
