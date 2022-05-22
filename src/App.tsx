import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.scss';
import { getManagerData } from './services';
import { ManagerDisplayData } from './types';
// import debounce from 'lodash.debounce';

const RESET_SELECTED_OPTION_INDEX = -1;
// const DEBOUNCE_TIME = 300;

const App = () => {
  const [managers, setManagers] = useState<ManagerDisplayData[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<typeof managers>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showList, setShowList] = useState(false);
  const inputEl = useRef<HTMLInputElement | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(RESET_SELECTED_OPTION_INDEX);

  useEffect(() => {
    (async () => {
      const data = await getManagerData();
      setManagers(data);
      setFilteredManagers(data);
    })();
  }, []);

  const inputChangeHandler = useCallback(
    (target: EventTarget) => {
      if (target instanceof HTMLInputElement) {
        setSearchTerm(target.value);
        const { value } = target;
        const valueWithNoSpaces = value.replace(/\s/g, '');
        if (!valueWithNoSpaces) setFilteredManagers(managers);
        else {
          const searchRegex = new RegExp(valueWithNoSpaces, `i`);
          const data = managers.filter(({ searchTerm }) => searchTerm.match(searchRegex));
          setFilteredManagers(data);
        }
        setShowList(true);
      }
    },
    [managers]
  );

  // const debouncedInputChangeHandler = useMemo(() => debounce(inputChangeHandler, DEBOUNCE_TIME), [inputChangeHandler]);

  useEffect(
    () => setSelectedOptionIndex(showList && filteredManagers.length ? 0 : RESET_SELECTED_OPTION_INDEX),
    [showList, filteredManagers]
  );

  const inputKeyDownHandler = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showList) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedOptionIndex(selectedOptionIndex + 1);
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedOptionIndex(selectedOptionIndex - 1);
          return;
        case 'Enter':
          e.preventDefault();
          if (selectedOptionIndex === RESET_SELECTED_OPTION_INDEX) return;
          setSearchTerm(filteredManagers[selectedOptionIndex].name);
          setShowList(false);
          return;
        default:
          return;
      }
    },
    [showList, selectedOptionIndex, filteredManagers]
  );

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
        onInput={(e) => inputChangeHandler(e.target)}
        onFocus={() => setShowList(true)}
        onBlur={() => setShowList(false)}
        onKeyDown={(e) => inputKeyDownHandler(e)}
      />
      <span className="icon material-symbols-outlined">expand_{showList ? 'less' : 'more'}</span>
      <ul id="managerList" role="listbox" style={{ display: showList ? 'block' : 'none' }}>
        {filteredManagers.length ? (
          filteredManagers.map((manager, i) => (
            <li key={manager.id} role="option" aria-selected={i === selectedOptionIndex}>
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
