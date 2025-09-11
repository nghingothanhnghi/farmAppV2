import React from 'react';
import { Link, useLocation } from 'react-router';
import type { ListLinkProps } from '../../models/types/ListLinkProps';
import Tooltip from './Tooltip';

const ListLink: React.FC<ListLinkProps> = ({
  to,
  icon,
  label,
  active,
  onClick,
  iconOnlyMode = false,
}) => {
  const location = useLocation();
  const isActive = active ?? location.pathname === to;
  const isIconOnly = iconOnlyMode || (!!icon && !label);

  const link = (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center
        ${isIconOnly ? 'justify-center w-10 h-10 p-2' : 'space-x-3 px-4 py-2'}
        rounded-lg transition-colors duration-200
        hover:bg-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 hover:text-gray-800
        ${isActive ? 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-100' : 'text-gray-800 dark:text-zinc-300'}
      `}
    >
      {icon && <div className="text-xl">{icon}</div>}
      {!isIconOnly && label && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
    </Link>
  );

  if (isIconOnly && label) {
    return <Tooltip content={label}>{link}</Tooltip>;
  }

  return link;
};

export default ListLink;
