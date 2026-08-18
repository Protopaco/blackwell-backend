import { ActivityRowType } from '#models/TimesheetManifest.js';

// Maps a row's pay-type tag to the plain-English unit its Total column value is captured in — FlatRate
// rows are counted in whole shifts, everything else (Hourly, Salary, and the time-off categories) is
// logged in decimal hours. Displayed next to each activity row's Total cell — see buildActivityRow.
const getActivityRowUnitLabel = (rowType: ActivityRowType): 'hours' | 'shifts' => (rowType === 'FlatRate' ? 'shifts' : 'hours');

export default getActivityRowUnitLabel;
