import Activity from '#models/Activity.js';
import Client from '#models/Client.js';
import Employee from '#models/Employee.js';
import PayPeriodResponse from '#models/PayPeriodResponse.js';

interface TimesheetStatusState {
  client: Client;
  employee: Employee;
  payPeriod: PayPeriodResponse;
  activities: Activity[];
}

export default TimesheetStatusState;
