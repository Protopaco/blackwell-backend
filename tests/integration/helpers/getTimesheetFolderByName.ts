import request from 'supertest';
import app from '#app.js';
import TimesheetFolder from '#models/TimesheetFolder.js';

const getTimesheetFolderByName = async (
  clientId: string,
  timesheetFolderName: string,
): Promise<TimesheetFolder> => {
  const response = await request(app).get(`/api/v1/timesheetFolder/${clientId}`);
  if (response.status !== 200) {
    throw new Error(
      `getTimesheetFolderByName failed: ${response.status} ${JSON.stringify(response.body)}`,
    );
  }

  const timesheetFolder = response.body.find(
    (candidate: TimesheetFolder) => candidate.timesheetFolderName === timesheetFolderName,
  );
  if (!timesheetFolder) {
    throw new Error(`TimesheetFolder not found in list: ${timesheetFolderName}`);
  }

  return timesheetFolder;
};

export default getTimesheetFolderByName;
