interface TimesheetDetail {
  totalHours: number | null;
  flatRateQuantity: number | null;
  employeeSigned: boolean;
  supervisorSigned: boolean;
  includeInPayroll: boolean;
}

export default TimesheetDetail;
