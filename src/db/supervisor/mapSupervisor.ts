import Supervisor from "#models/Supervisor.js";

// Converts a raw Supervisors sheet row into a Supervisor model.
const mapSupervisor = (row: Record<string, unknown>): Supervisor => ({
  supervisorId: row["SupervisorId"] as string,
  firstName: row["FirstName"] as string,
  lastName: row["LastName"] as string,
  email: row["Email"] as string,
});

export default mapSupervisor;
