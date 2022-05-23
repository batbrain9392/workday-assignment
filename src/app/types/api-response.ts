export interface APIResponse {
  data: Employee[];
  included: (Account | Employee)[];
  meta: Meta;
  links: APIResponseLinks;
}

export enum EntityType {
  Accounts = 'accounts',
  Companies = 'companies',
  Employees = 'employees',
}

export function isAccount(item: APIResponse['included'][0]): item is Account {
  return item.type === EntityType.Accounts;
}

export interface Employee {
  type: EntityType.Employees;
  id: string;
  links: Pick<APIResponseLinks, 'self'>;
  attributes: EmployeeAttributes;
  relationships: Relationships;
}

export interface EmployeeAttributes {
  identifier: null;
  firstName: string;
  lastName: string;
  name: string;
  features: string[];
  avatar: null;
  employmentStart: string;
  external: boolean;
  'Last Year Bonus'?: number;
  'Business Unit'?: string;
  'Commute Time'?: number;
  Age?: string;
  Department?: string;
  Gender?: string;
  'Job Level'?: string;
  'Local Office'?: string;
  '% of target'?: number;
  Region?: string;
  Salary?: number;
  Tenure?: string;
}

export interface Relationships {
  company: { data: { type: EntityType.Companies; id: string } };
  account: { data: { type: EntityType.Accounts; id: string } };
  phones: { data: unknown[] };
  Manager?: { data: { type: EntityType.Employees; id: string } };
}

export interface Account {
  type: EntityType.Accounts;
  id: string;
  links: Pick<APIResponseLinks, 'self'>;
  attributes: AccountAttributes;
}

export interface AccountAttributes {
  email: string;
  locale: null;
  timezone: null;
  bouncedAt: null;
  bounceReason: null;
  localeEffective: string;
  timezoneEffective: null;
}

export interface APIResponseLinks {
  self: string;
  first: string;
  last: string;
}

export interface Meta {
  page: { total: number };
}
