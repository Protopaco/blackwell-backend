import ClientCreateRequest from '#models/ClientCreateRequest.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import { TimeInputMethod } from '#models/TimeInputMethod.js';
import {
  DEV_TEST_DATA_LATE_CLIENT_CODE,
  DEV_TEST_DATA_LATE_CLIENT_NAME,
} from '../constants.js';

const buildLateClientRequest = (rootFolderLink: string): ClientCreateRequest => ({
  clientName: DEV_TEST_DATA_LATE_CLIENT_NAME,
  clientCode: DEV_TEST_DATA_LATE_CLIENT_CODE,
  employeePayrollFolder: {
    createNew: true,
    rootFolderLink,
  },
  settings: {
    timeInputMethod: TimeInputMethod.TotalHours,
    payPeriodInterval: PayPeriodInterval.BiWeekly,
    payPeriodStartDate: '2026-01-05',
  },
});

export default buildLateClientRequest;
