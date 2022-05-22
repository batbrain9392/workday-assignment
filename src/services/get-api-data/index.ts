import { APIResponse, isAccount, DisplayData } from '../../types';

const API_URL = `https://gist.githubusercontent.com/daviferreira/41238222ac31fe36348544ee1d4a9a5e/raw/5dc996407f6c9a6630bfcec56eee22d4bc54b518/employees.json`;

export function fetchManagerDataController() {
  const controller = new AbortController();
  const { signal } = controller;
  return {
    abort: () => controller.abort(),
    fetchManagerData: async () => {
      const res = await fetch(API_URL, { signal, method: 'GET' });
      const apiResponse: APIResponse = await res.json();
      return convertToManagerDisplayData(apiResponse);
    },
  };
}

function convertToManagerDisplayData({ data, included }: APIResponse): DisplayData[] {
  const accounts = included.filter(isAccount);
  return data
    .sort((a, b) => a.attributes.name.localeCompare(b.attributes.name))
    .map(({ id, attributes: { firstName, lastName, name }, relationships }) => {
      const email = accounts.find(({ id }) => id === relationships.account.data.id)?.attributes.email ?? ``;
      return {
        id,
        name,
        firstName,
        lastName,
        email,
      };
    });
}
