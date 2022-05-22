import React from 'react';
import { DisplayData } from '../../../types';
import './index.scss';

const Option_PureFunction = ({
  data,
  selected,
  children,
}: React.PropsWithChildren<{ data?: DisplayData; selected?: boolean }>) => {
  // list empty option
  if (!data) {
    return <li className="color-muted">{children}</li>;
  }

  const initials = `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase();

  // valid list option
  return (
    <li key={data.id} role="option" aria-label={data.name} aria-selected={selected}>
      <div className="initials">{initials}</div>
      <div>
        <div className="name">{data.name}</div>
        <div className="email color-muted">{data.email}</div>
      </div>
    </li>
  );
};

export const Option = React.memo(Option_PureFunction);
