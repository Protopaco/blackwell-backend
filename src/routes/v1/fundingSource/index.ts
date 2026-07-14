import { Router } from 'express';
import getFundingSourcesRouter from './getFundingSources.js';
import postFundingSourceRouter from './postFundingSource.js';
import putFundingSourceRouter from './putFundingSource.js';
import deleteFundingSourceRouter from './deleteFundingSource.js';

const router = Router();

router.use(getFundingSourcesRouter);
router.use(postFundingSourceRouter);
router.use(putFundingSourceRouter);
router.use(deleteFundingSourceRouter);

export default router;
