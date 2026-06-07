import { Router } from 'express';
import getClientsRouter from './getClients.js';

const router = Router();

router.use(getClientsRouter);

export default router;
