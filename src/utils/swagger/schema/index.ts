import client from './client.js';
import payPeriod from './payPeriod.js';
import timesheetStatusResponse from './timesheetStatusResponse.js';
import error from './error.js';

const schemas = {
  ...client,
  ...payPeriod,
  ...timesheetStatusResponse,
  ...error,
};

export default schemas;
