const ClientStatus = {
  Active: 'Active',
  Inactive: 'Inactive',
} as const;

type ClientStatus = typeof ClientStatus[keyof typeof ClientStatus];

export { ClientStatus };
export type { ClientStatus as ClientStatusType };
