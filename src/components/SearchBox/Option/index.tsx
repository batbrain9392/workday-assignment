import React from 'react';
import { ManagerDisplayData } from '../../../types';
import './index.scss';

export const Option = ({ manager, selected }: { manager?: ManagerDisplayData; selected?: boolean }) => {
  if (!manager) {
    return <li className="color-muted">No matching items</li>;
  }
  return (
    <li key={manager.id} role="option" aria-selected={selected}>
      <div className="initials">{manager.initials}</div>
      <div>
        <div className="name">{manager.name}</div>
        <div className="email color-muted">{manager.email}</div>
      </div>
    </li>
  );
};
