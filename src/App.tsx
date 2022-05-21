import React, { useEffect, useState } from 'react';
import './App.css';
import { Option } from './components';
import { getManagerData } from './services';
import { ManagerDisplayData } from './types';

const App = () => {
  const [managers, setManagers] = useState<ManagerDisplayData[]>([]);

  useEffect(() => {
    (async () => {
      setManagers(await getManagerData());
    })();

    return () => {};
  }, []);

  return (
    <ul>
      {managers.map((manager) => (
        <Option key={manager.id} data={manager}></Option>
      ))}
    </ul>
  );
};

export default App;
