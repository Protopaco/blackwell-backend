import Guid from './Guid.js';

interface Supervisor {
  supervisorId: Guid;
  supervisorFirstName: string;
  supervisorLastName: string;
  supervisorEmail: string;
}

export default Supervisor;
