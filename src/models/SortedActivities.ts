import ActivityGroup from '#models/ActivityGroup.js';

interface SortedActivities {
  workActivities: ActivityGroup[];
  timeOffActivities: ActivityGroup[];
  flatRateActivities: ActivityGroup[];
}

export default SortedActivities;
