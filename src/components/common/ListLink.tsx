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
  backgroundMode = 'on',
  ...rest // 👈 capture extra props like data-id
}) => {
  const location = useLocation();
  const isActive = active ?? location.pathname === to;
  const isIconOnly = iconOnlyMode || (!!icon && !label);
  const hasBg = backgroundMode === 'on';

  const link = (
    <Link
      to={to}
      onClick={onClick}
      {...rest} // 👈 spread them into the Link
      className={`
        flex items-center rounded-lg transition-colors duration-200
        ${isIconOnly ? 'justify-center w-10 h-10 p-2' : 'space-x-3 px-4 py-2'}
        ${hasBg
          ? `
            hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100
            ${isActive ? 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-100' : 'text-gray-800 dark:text-zinc-300'}
          `
          : `
            hover:text-blue-600 dark:hover:text-blue-400
            ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-zinc-300'}
          `
        }
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
