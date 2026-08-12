import Guid from '#models/Guid.js';
import { EmployeeActivityPayRateTypeType } from './EmployeeActivityPayRateType.js';

// API-facing shape for one activity-rate row on Employee create/update requests and responses — id is
// optional since a newly-added row (not yet saved) doesn't have one; employeeName/activityName are
// omitted since those are server-derived, sheet-readability-only fields on the underlying bridge row.
interface EmployeeActivityRateInput {
  id?: Guid;
  activityId: Guid;
  payRateType: EmployeeActivityPayRateTypeType;
  payRate: number;
  holidayPayRate: number;
}

export default EmployeeActivityRateInput;
