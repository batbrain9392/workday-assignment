import React, { useEffect, useState } from 'react';
import './App.scss';
import { fetchManagerDataController } from './services';
import { ManagerDisplayData } from './types';
import { SearchBox } from './components';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<ManagerDisplayData[]>([]);
  const [error, setError] = useState('');

  /**
   * Fetch data on mount.
   * Abort on unmount.
   */
  useEffect(() => {
    const { abort, fetchManagerData } = fetchManagerDataController();
    fetchManagerData()
      .then((data) => {
        setError('');
        setManagers(data);
      })
      .catch((err: Error) => {
        setError(err.message);
        setManagers([]);
      })
      .finally(() => setLoading(false));
    return abort;
  }, []);

  return (
    <main>
      <SearchBox {...{ managers, loading }}></SearchBox>
      {error && <div className="error">{error}</div>}
    </main>
  );
};

export default App;
