import FolderInput from '#models/FolderInput.js';
import Settings from '#models/Settings.js';

interface ClientCreateRequest {
  clientName: string;
  clientCode: string;
  // rootFolderLink is only used (and required) when employeePayrollFolder.createNew is true — it's
  // the transient parent-location hint, never persisted to the Clients row.
  employeePayrollFolder: FolderInput & { rootFolderLink?: string };
  // Omitted entirely means "create new" (the agreed default) for both of these.
  payrollConfigFolder?: FolderInput;
  payrollReportFolder?: FolderInput;
  settings: Settings;
}

export default ClientCreateRequest;
