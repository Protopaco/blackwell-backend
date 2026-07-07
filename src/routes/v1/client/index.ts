import { Router } from "express";
import getClientsRouter from "./getClients.js";
import getClientEmployeesRouter from "./getClientEmployees.js";
import getClientSummaryRouter from "./getClientSummary.js";

const router = Router();

router.use(getClientsRouter);
router.use(getClientEmployeesRouter);
router.use(getClientSummaryRouter);

export default router;
