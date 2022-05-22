import React from 'react';
import './App.scss';
import { useFetchManagerData } from './services';
import { SearchBox } from './components';

const API_URL = `https://gist.githubusercontent.com/daviferreira/41238222ac31fe36348544ee1d4a9a5e/raw/5dc996407f6c9a6630bfcec56eee22d4bc54b518/employees.json`;

const App = () => {
  const { data, loading, error } = useFetchManagerData(API_URL);

  return loading ? (
    <div>Loading...</div>
  ) : (
    <main>
      <SearchBox list={data} placeholder="Choose Manager" listAriaLabel="Manager List"></SearchBox>
      {error && <div className="error">{error}</div>}
    </main>
  );
};

export default App;
