import { APIResponse, isAccount, ManagerDisplayData } from '../../types';

const API_URL = `https://gist.githubusercontent.com/daviferreira/41238222ac31fe36348544ee1d4a9a5e/raw/5dc996407f6c9a6630bfcec56eee22d4bc54b518/employees.json`;

export async function getManagerData(): Promise<ManagerDisplayData[]> {
  const res = await fetch(API_URL);
  const apiResponse: APIResponse = await res.json();
  return convertToManagerDisplayData(apiResponse);
}

function convertToManagerDisplayData({ data, included }: APIResponse): ManagerDisplayData[] {
  const accounts = included.filter(isAccount);
  return data.map(({ id, attributes: { firstName, lastName, name }, relationships }) => {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const searchTerm = `${firstName}${lastName}`.toLowerCase();
    const email = accounts.find(({ id }) => id === relationships.account.data.id)?.attributes.email ?? ``;
    return {
      id,
      initials,
      name: name,
      email,
      searchTerm,
    };
  });
}
