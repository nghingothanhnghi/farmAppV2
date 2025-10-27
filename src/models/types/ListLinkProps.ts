import React from 'react';

export type ListLinkProps = {
  to: string;
  icon?: React.ReactNode;
  label?: string;
  active?: boolean;
  iconOnlyMode?: boolean;
  onClick?: () => void;
  backgroundMode?: 'on' | 'off';
};
