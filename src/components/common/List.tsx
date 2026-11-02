import React from 'react';
import type { IListItem } from '../../models/interfaces/IListItem';
import type { ListType } from '../../models/types/ListType';

interface ListProps {
  items: IListItem[];
  showIcons?: boolean;
  listStyle?: ListType;
  className?: string;
}

const List: React.FC<ListProps> = ({
  items,
  showIcons = false,
  listStyle = 'disc',
  className = '',
}) => {
  const listClass =
    listStyle === 'disc'
      ? 'list-disc list-outside pl-3.5'
      : listStyle === 'none'
        ? 'list-none'
        : '';

  return (
    <ul className={`${listClass} ${className}`}>
      {items.map((item) => (
        <li
          key={item.id}
          className={showIcons ? 'mb-1' : 'mb-1'}
        >
          {showIcons && item.icon ? (
            <span className="inline-flex items-center gap-2">
              {item.icon}
              <span>{item.content}</span>
            </span>
          ) : (
            item.content
          )}
        </li>
      ))}
    </ul>
  );
};

export default List;
