import { ClientStatusType } from '#models/ClientStatus.js';

// All fields optional — a request only needs to include what's actually changing (e.g. an
// activate/deactivate action shouldn't have to resend clientName/clientCode from a possibly-stale form).
interface ClientUpdateRequest {
  status?: ClientStatusType;
  clientName?: string;
  clientCode?: string;
}

export default ClientUpdateRequest;
