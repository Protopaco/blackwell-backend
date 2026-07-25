import additionalExpense from './additionalExpense.js';
import allocationReportRow from './allocationReportRow.js';
import activity from './activity.js';
import client from './client.js';
import clientCreateRequest from './clientCreateRequest.js';
import clientUpdateRequest from './clientUpdateRequest.js';
import clientSummary from './clientSummary.js';
import employee from './employee.js';
import employeeCreateRequest from './employeeCreateRequest.js';
import employeeExpense from './employeeExpense.js';
import employeeExpenseUpdate from './employeeExpenseUpdate.js';
import folderInput from './folderInput.js';
import fundingSource from './fundingSource.js';
import holiday from './holiday.js';
import payPeriod from './payPeriod.js';
import payPeriodConfigSnapshot from './payPeriodConfigSnapshot.js';
import settings from './settings.js';
import supervisor from './supervisor.js';
import timesheetFolder from './timesheetFolder.js';
import timesheetFolderCreateRequest from './timesheetFolderCreateRequest.js';
import timesheetFolderUpdateRequest from './timesheetFolderUpdateRequest.js';
import timesheetStatusResponse from './timesheetStatusResponse.js';
import error from './error.js';

const schemas = {
  ...additionalExpense,
  ...allocationReportRow,
  ...activity,
  ...client,
  ...clientCreateRequest,
  ...clientUpdateRequest,
  ...clientSummary,
  ...employee,
  ...employeeCreateRequest,
  ...employeeExpense,
  ...employeeExpenseUpdate,
  ...folderInput,
  ...fundingSource,
  ...holiday,
  ...payPeriod,
  ...payPeriodConfigSnapshot,
  ...settings,
  ...supervisor,
  ...timesheetFolder,
  ...timesheetFolderCreateRequest,
  ...timesheetFolderUpdateRequest,
  ...timesheetStatusResponse,
  ...error,
};

export default schemas;
