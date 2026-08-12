import writeSettings from '#db/settings/writeSettings.js';
import getClientById from '#services/client/getClientById.js';
import readPayPeriods from '#db/payPeriod/readPayPeriods.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';
import Settings from '#models/Settings.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites the client's Settings record in PayrollConfig. Settings are client-wide (unlike per-pay-
// period mutations such as addActivityToPayPeriod), so every pay period's cached config snapshot needs
// invalidating here — not just payrollConfigCache — or generateTimesheets/generatePayrollReport/
// getTimesheetStatuses keep reading a stale timeInputMethod (or other setting) for up to the snapshot
// cache's 24-hour TTL.
const updateSettings = async (clientId: string, settings: Settings): Promise<void> => {
  logger.info(`updateSettings clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  await writeSettings(client.payrollConfigFileId, settings);
  payrollConfigCache.delete(client.payrollConfigFileId);

  const payPeriods = await readPayPeriods(client.payPeriodRegistryFileId);
  for (const payPeriod of payPeriods) {
    if (payPeriod.payrollReportFileId) {
      payPeriodConfigSnapshotCache.delete(payPeriod.payrollReportFileId);
    }
  }
};

export default updateSettings;
