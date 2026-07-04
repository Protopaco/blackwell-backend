import client from './client.js';
import employee from './employee.js';
import payPeriod from './payPeriod.js';
import timesheetStatusResponse from './timesheetStatusResponse.js';
import error from './error.js';

const schemas = {
  ...client,
  ...employee,
  ...payPeriod,
  ...timesheetStatusResponse,
  ...error,
};

export default schemas;
