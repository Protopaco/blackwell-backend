import { Router } from "express";
import getClientsRouter from "./getClients.js";
import getClientEmployeesRouter from "./getClientEmployees.js";

const router = Router();

router.use(getClientsRouter);
router.use(getClientEmployeesRouter);

export default router;
