import Activity from '#models/Activity.js';

interface TestActivityMix {
  hourlyPayRate1Activity: Activity;
  hourlyPayRate2Activity: Activity;
  flatPayRate1Activity: Activity;
  flatPayRate2Activity: Activity;
  activities: Activity[];
}

export default TestActivityMix;
