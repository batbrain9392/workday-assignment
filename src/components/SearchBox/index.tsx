import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import { ManagerDisplayData } from '../../types';
import { Option } from './Option';
import './index.scss';

const RESET_SELECTED_OPTION_INDEX = -1;
const DEBOUNCE_TIME = 300;

export const SearchBox = ({ managers, loading }: { managers: ManagerDisplayData[]; loading: boolean }) => {
  const [filteredManagers, setFilteredManagers] = useState<typeof managers>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showList, setShowList] = useState(false);
  const inputEl = useRef<HTMLInputElement | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(RESET_SELECTED_OPTION_INDEX);
  const listEl = useRef<HTMLUListElement | null>(null);

  /**
   * Set the displayed (filtered) item list with the full data on mount.
   */
  useEffect(() => {
    setFilteredManagers(managers);
  }, [managers]);

  /**
   * Filter the main list and set the displayed list.
   * Function has been debounced to increase performance.
   */
  const filterResults = useMemo(
    () =>
      debounce((value: string) => {
        const valueWithNoSpaces = value.replace(/\s/g, '');
        if (!valueWithNoSpaces) {
          setFilteredManagers(managers);
          return;
        }
        const searchRegex = new RegExp(valueWithNoSpaces, `i`);
        const data = managers.filter(({ searchTerm }) => searchTerm.match(searchRegex));
        setFilteredManagers(data);
      }, DEBOUNCE_TIME),
    [managers]
  );

  /**
   * Filters the list for every search term change.
   */
  useEffect(() => {
    filterResults(searchTerm);
  }, [filterResults, searchTerm]);

  /**
   * Sets the search term on input and shows the list.
   */
  const textboxInputHandler = useCallback((target: EventTarget) => {
    if (!(target instanceof HTMLInputElement)) return;
    const { value } = target;
    setSearchTerm(value);
    setShowList(true);
  }, []);

  /**
   * Sets the first option as selected when the list opens with valid list items.
   * Resets the selected option index when the list closes or if the list is empty.
   */
  useEffect(() => {
    setSelectedOptionIndex(showList && filteredManagers.length ? 0 : RESET_SELECTED_OPTION_INDEX);
  }, [showList, filteredManagers]);

  /**
   * Scrolls the selected option into view.
   * Skips when the list is empty.
   */
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

  /**
   * Sets the selected option index on arrow key navigation.
   * Sets the selected name in the textbox and filters the list accordingly on enter key.
   * Skips when the list is empty.
   */
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
          setShowList(false);
          if (selectedOptionIndex !== RESET_SELECTED_OPTION_INDEX) {
            const result = filteredManagers[selectedOptionIndex].name;
            setSearchTerm(result);
            setShowList(false);
          }
          return;
        default:
          return;
      }
    },
    [showList, selectedOptionIndex, filteredManagers]
  );

  return (
    // container
    <div className="container" aria-owns="managerList">
      <input
        type="text"
        placeholder={loading ? 'Loading...' : 'Choose Manager'}
        autoComplete="off"
        role="combobox"
        aria-label={loading ? 'Loading manager list' : 'Choose Manager'}
        aria-controls="managerList"
        aria-expanded={showList}
        aria-autocomplete="list"
        ref={inputEl}
        value={searchTerm}
        disabled={loading}
        onInput={(e) => textboxInputHandler(e.target)}
        onFocus={() => setShowList(true)}
        onBlur={() => setShowList(false)}
        onKeyDown={(e) => textboxKeyDownHandler(e)}
      />
      {/* icon */}
      {loading ? null : <span className="icon material-symbols-outlined">expand_{showList ? 'less' : 'more'}</span>}
      {/* list container */}
      <ul
        id="managerList"
        aria-label="Manager List"
        role="listbox"
        style={{ display: showList ? 'block' : 'none' }}
        ref={listEl}
      >
        {managers.length ? (
          filteredManagers.length ? (
            // valid list items
            filteredManagers.map((manager, i) => (
              <Option key={manager.id} manager={manager} selected={i === selectedOptionIndex} />
            ))
          ) : (
            <Option>No matching items</Option>
          )
        ) : (
          <Option>List is empty</Option>
        )}
      </ul>
    </div>
  );
};
