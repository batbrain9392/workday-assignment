import React from 'react';
import { ManagerDisplayData } from '../../types';
import './index.scss';

export const Option = ({ data, selected }: { data: ManagerDisplayData; selected: boolean }) => {
  return (
    <li role="option" aria-selected={selected}>
      <div className="initials">{data.initials}</div>
      <div>
        <div className="name">{data.name}</div>
        <div className="email">{data.email}</div>
      </div>
    </li>
  );
};
