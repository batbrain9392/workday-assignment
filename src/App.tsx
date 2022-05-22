import React, { useEffect, useState } from 'react';
import './App.scss';
import { getManagerData } from './services';
import { ManagerDisplayData } from './types';
import { SearchBox } from './components';

const App = () => {
  const [managers, setManagers] = useState<ManagerDisplayData[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getManagerData();
      setManagers(data);
    })();
  }, []);

  return <SearchBox managers={managers}></SearchBox>;
};

export default App;
