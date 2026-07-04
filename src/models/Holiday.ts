import Guid from '#models/Guid.js';

interface Holiday {
  holidayId: Guid;
  holidayName: string;
  holidayDate: string;
}

export default Holiday;
