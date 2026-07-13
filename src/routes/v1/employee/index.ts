import { Router } from 'express';
import getEmployeesRouter from './getEmployees.js';
import postEmployeeRouter from './postEmployee.js';
import putEmployeeRouter from './putEmployee.js';

const router = Router();

router.use(getEmployeesRouter);
router.use(postEmployeeRouter);
router.use(putEmployeeRouter);

export default router;
