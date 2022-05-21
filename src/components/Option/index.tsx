import React from 'react';
import { ManagerDisplayData } from '../../types';
import './index.css';

export const Option = ({ data }: { data: ManagerDisplayData }) => {
  return (
    <li>
      <div className="initials">{data.initials}</div>
      <div>
        <div className="name">{data.name}</div>
        <div className="email">{data.email}</div>
      </div>
    </li>
  );
};
