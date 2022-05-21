import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import { Option } from './components';
import { getManagerData } from './services';
import { ManagerDisplayData } from './types';
import debounce from 'lodash.debounce';

const App = () => {
  const [managers, setManagers] = useState<ManagerDisplayData[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<typeof managers>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    (async () => setManagers(await getManagerData()))();
  }, []);

  const inputChangeHandler = useCallback(
    (value: string) => {
      const valueWithNoSpaces = value.replace(/\s/g, '');
      if (!valueWithNoSpaces) setFilteredManagers([]);
      else {
        const searchRegex = new RegExp(valueWithNoSpaces, `i`);
        const data = managers.filter(({ searchTerm }) => searchTerm.match(searchRegex));
        setFilteredManagers(data);
      }
    },
    [managers]
  );

  const debouncedInputChangeHandler = useMemo(() => debounce(inputChangeHandler, 300), [inputChangeHandler]);

  useEffect(() => debouncedInputChangeHandler(searchTerm), [searchTerm, debouncedInputChangeHandler]);

  return (
    <>
      <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <ul>
        {(filteredManagers.length ? filteredManagers : managers).map((manager) => (
          <Option key={manager.id} data={manager}></Option>
        ))}
      </ul>
    </>
  );
};

export default App;
