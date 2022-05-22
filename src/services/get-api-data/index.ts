import { useEffect, useState } from 'react';
import { APIResponse, isAccount, DisplayData } from '../../types';

/**
 * Fetch data on mount.
 * Abort on unmount.
 */
export function useFetchManagerData(url: string) {
  const [data, setData] = useState<DisplayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const { signal } = controller;
    fetch(url, { signal, method: 'GET' })
      .then((res) => res.json())
      .then((apiResponse: APIResponse) => {
        const data = convertToManagerDisplayData(apiResponse);
        setError('');
        setData(data);
      })
      .catch((error: Error) => {
        setError(error.message);
        setData([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

/**
 * Sorts the data by name and maps their emails from the matching account.
 */
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
