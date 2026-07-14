import { Router } from 'express';
import getSupervisorsRouter from './getSupervisors.js';
import postSupervisorRouter from './postSupervisor.js';
import putSupervisorRouter from './putSupervisor.js';
import deleteSupervisorRouter from './deleteSupervisor.js';

const router = Router();

router.use(getSupervisorsRouter);
router.use(postSupervisorRouter);
router.use(putSupervisorRouter);
router.use(deleteSupervisorRouter);

export default router;
