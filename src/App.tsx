import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.scss';
import { getManagerData } from './services';
import { ManagerDisplayData } from './types';
import debounce from 'lodash.debounce';

const App = () => {
  const [managers, setManagers] = useState<ManagerDisplayData[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<typeof managers>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showList, setShowList] = useState(false);
  const inputEl = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getManagerData();
      setManagers(data);
      setFilteredManagers(data);
    })();
  }, []);

  const inputChangeHandler = useCallback(
    (value: string) => {
      const valueWithNoSpaces = value.replace(/\s/g, '');
      if (!valueWithNoSpaces) setFilteredManagers(managers);
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
    <div className="container" aria-owns="managerList">
      <input
        type="text"
        placeholder="Choose Manager"
        autoComplete="off"
        role="combobox"
        aria-controls="managerList"
        aria-expanded={showList}
        aria-autocomplete="list"
        ref={inputEl}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowList(true)}
        onBlur={() => setShowList(false)}
      />
      <span className="icon material-symbols-outlined">expand_{showList ? 'less' : 'more'}</span>
      <ul id="managerList" role="listbox" style={{ display: showList ? 'block' : 'none' }}>
        {filteredManagers.length ? (
          filteredManagers.map((manager, i) => (
            <li key={manager.id} role="option" aria-selected={i === 0}>
              <div className="initials">{manager.initials}</div>
              <div>
                <div className="name">{manager.name}</div>
                <div className="email color-muted">{manager.email}</div>
              </div>
            </li>
          ))
        ) : (
          <li className="color-muted">No matching items</li>
        )}
      </ul>
    </div>
  );
};

export default App;
