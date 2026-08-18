import Activity from '#models/Activity.js';

interface ActivityGroup {
  groupLabel: string | null;
  activities: Activity[];
}

export default ActivityGroup;
