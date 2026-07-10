import Guid from "#models/Guid.js";

interface Supervisor {
  supervisorId: Guid;
  firstName: string;
  lastName: string;
  email: string;
}

export default Supervisor;
