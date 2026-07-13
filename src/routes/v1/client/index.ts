import { Router } from "express";
import getClientsRouter from "./getClients.js";
import getClientEmployeesRouter from "./getClientEmployees.js";
import getClientSummaryRouter from "./getClientSummary.js";
import postClientRouter from "./postClient.js";
import putClientRouter from "./putClient.js";

const router = Router();

router.use(getClientsRouter);
router.use(getClientEmployeesRouter);
router.use(getClientSummaryRouter);
router.use(postClientRouter);
router.use(putClientRouter);

export default router;
