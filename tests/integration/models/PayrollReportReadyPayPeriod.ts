import Client from '#models/Client.js';
import Employee from '#models/Employee.js';
import PayPeriodResponse from '#models/PayPeriodResponse.js';
import TestActivityMix from './TestActivityMix.js';

interface PayrollReportReadyPayPeriod {
  client: Client;
  completeEmployee: Employee;
  incompleteEmployee: Employee;
  payPeriod: PayPeriodResponse;
  activityMix: TestActivityMix;
}

export default PayrollReportReadyPayPeriod;
