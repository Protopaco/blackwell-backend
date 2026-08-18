import Guid from '#models/Guid.js';

interface ActivityReorderUpdate {
  activityId: Guid;
  groupLabel: string | null;
  sortOrder: number;
}

export default ActivityReorderUpdate;
