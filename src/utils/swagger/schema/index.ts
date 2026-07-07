import additionalExpense from './additionalExpense.js';
import allocationReportRow from './allocationReportRow.js';
import activity from './activity.js';
import client from './client.js';
import clientSummary from './clientSummary.js';
import employee from './employee.js';
import employeeExpense from './employeeExpense.js';
import fundingSource from './fundingSource.js';
import holiday from './holiday.js';
import payPeriod from './payPeriod.js';
import settings from './settings.js';
import supervisor from './supervisor.js';
import timesheetStatusResponse from './timesheetStatusResponse.js';
import error from './error.js';

const schemas = {
  ...additionalExpense,
  ...allocationReportRow,
  ...activity,
  ...client,
  ...clientSummary,
  ...employee,
  ...employeeExpense,
  ...fundingSource,
  ...holiday,
  ...payPeriod,
  ...settings,
  ...supervisor,
  ...timesheetStatusResponse,
  ...error,
};

export default schemas;
