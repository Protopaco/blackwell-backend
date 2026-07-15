// Minimal structural shape covering what assertions need from a supertest response — avoids depending
// on supertest/superagent's exact exported type names, which vary across their CJS-style type declarations.
interface ApiResponse {
  status: number;
  body: any;
}

interface Scenario<TInput> {
  label: string;
  description: string;
  input: TInput;
  expectedStatus: number;
  assert?: (response: ApiResponse) => void;
}

export type { Scenario, ApiResponse };
