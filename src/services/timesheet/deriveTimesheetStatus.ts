import { TimesheetStatus, TimesheetStatusType } from '#models/TimesheetStatus.js';

interface DeriveTimesheetStatusInput {
  totalHours: number | null;
  employeeSigned: boolean;
  supervisorSigned: boolean;
  includedInCurrentHours: boolean;
}

// Derives the five-state TimesheetStatus from raw signature/hours data plus whether this employee's
// hours were included in the most recently generated payroll report (current_hours tab).
const deriveTimesheetStatus = ({
  totalHours,
  employeeSigned,
  supervisorSigned,
  includedInCurrentHours,
}: DeriveTimesheetStatusInput): TimesheetStatusType => {
  if (totalHours === null) return TimesheetStatus.NotGenerated;
  if (!employeeSigned) return TimesheetStatus.Generated;
  if (!supervisorSigned) return TimesheetStatus.Submitted;
  if (!includedInCurrentHours) return TimesheetStatus.Approved;
  return TimesheetStatus.Complete;
};

export default deriveTimesheetStatus;
