import client from './client.js';
import employee from './employee.js';
import employeeExpense from './employeeExpense.js';
import payPeriod from './payPeriod.js';
import timesheetStatusResponse from './timesheetStatusResponse.js';
import error from './error.js';

const schemas = {
  ...client,
  ...employee,
  ...employeeExpense,
  ...payPeriod,
  ...timesheetStatusResponse,
  ...error,
};

export default schemas;
