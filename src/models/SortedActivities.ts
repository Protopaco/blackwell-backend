import ActivityGroup from '#models/ActivityGroup.js';
import Guid from '#models/Guid.js';
import { EmployeeActivityPayRateTypeType } from '#models/EmployeeActivityPayRateType.js';

interface SortedActivities {
  workActivities: ActivityGroup[];
  timeOffActivities: ActivityGroup[];
  flatRateActivities: ActivityGroup[];
  payRateTypeByActivityId: Map<Guid, EmployeeActivityPayRateTypeType>;
}

export default SortedActivities;
