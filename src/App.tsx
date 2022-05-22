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
  const listEl = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getManagerData();
      setManagers(data);
      setFilteredManagers(data);
    })();
  }, []);

  const filterResults = useCallback(
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

  const textboxInputHandler = useCallback(
    (target: EventTarget) => {
      if (!(target instanceof HTMLInputElement)) return;
      setSearchTerm(target.value);
      const { value } = target;
      filterResults(value);
      setShowList(true);
    },
    [filterResults]
  );

  // const debouncedInputChangeHandler = useMemo(() => debounce(inputChangeHandler, DEBOUNCE_TIME), [inputChangeHandler]);

  useEffect(
    () => setSelectedOptionIndex(showList && filteredManagers.length ? 0 : RESET_SELECTED_OPTION_INDEX),
    [showList, filteredManagers]
  );

  useEffect(() => {
    if (selectedOptionIndex !== RESET_SELECTED_OPTION_INDEX) {
      if (!listEl?.current) return;
      const { current } = listEl;
      const { scrollTop, clientHeight } = current;
      const selectedOptionEl = current.children.item(selectedOptionIndex);
      if (!selectedOptionEl || !(selectedOptionEl instanceof HTMLLIElement)) return;
      const { offsetTop, offsetHeight } = selectedOptionEl;
      const offsetBottom = offsetTop + offsetHeight;
      const scrollBottom = scrollTop + clientHeight;
      if (offsetTop < scrollTop) current.scrollTop = offsetTop;
      else if (offsetBottom > scrollBottom) current.scrollTop = offsetBottom - clientHeight;
    }
  }, [selectedOptionIndex]);

  const textboxKeyDownHandler = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showList) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (selectedOptionIndex === RESET_SELECTED_OPTION_INDEX) return;
          const nextIndex = (selectedOptionIndex + 1) % filteredManagers.length;
          setSelectedOptionIndex(nextIndex);
          return;
        case 'ArrowUp':
          e.preventDefault();
          if (selectedOptionIndex === RESET_SELECTED_OPTION_INDEX) return;
          const previousIndex = (selectedOptionIndex || filteredManagers.length) - 1;
          setSelectedOptionIndex(previousIndex);
          return;
        case 'Enter':
          e.preventDefault();
          if (selectedOptionIndex !== RESET_SELECTED_OPTION_INDEX) {
            const result = filteredManagers[selectedOptionIndex].name;
            setSearchTerm(result);
            filterResults(result);
          }
          setShowList(false);
          return;
        default:
          return;
      }
    },
    [showList, selectedOptionIndex, filteredManagers, filterResults]
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
        onInput={(e) => textboxInputHandler(e.target)}
        onFocus={() => setShowList(true)}
        onBlur={() => setShowList(false)}
        onKeyDown={(e) => textboxKeyDownHandler(e)}
      />
      <span className="icon material-symbols-outlined">expand_{showList ? 'less' : 'more'}</span>
      <ul id="managerList" role="listbox" style={{ display: showList ? 'block' : 'none' }} ref={listEl}>
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
