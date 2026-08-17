import Activity from '#models/Activity.js';
import ActivityGroup from '#models/ActivityGroup.js';

// Flattens a bucket's ordered groups back into a plain activity list, discarding group boundaries —
// used when a caller needs every activity in a bucket but not the group structure itself.
const flattenActivityGroups = (groups: ActivityGroup[]): Activity[] =>
  groups.flatMap((group) => group.activities);

export default flattenActivityGroups;
