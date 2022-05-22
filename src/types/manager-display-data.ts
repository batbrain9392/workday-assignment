import { AccountAttributes, Employee, EmployeeAttributes } from './api-response';

export type DisplayData = Pick<Employee, 'id'> &
  Pick<EmployeeAttributes, 'name' | 'firstName' | 'lastName'> &
  Pick<AccountAttributes, 'email'>;
