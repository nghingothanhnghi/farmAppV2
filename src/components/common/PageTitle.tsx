// src/components/common/PageTitle.tsx
import React from 'react';
import type { PageTitleProps } from '../../models/interfaces/PageTitle';


const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  actions,
  align = 'left',        // new prop
  justify = 'between',
  width = '500px',
}) => {
  // Alignment classes
  const alignClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[align];

  // justify (horizontal)
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }[justify];
  return (
    <div className={`hidden lg:flex flex-col sm:flex-row justify-between gap-4 mb-5 ${alignClasses} ${justifyClasses}`}>
      <div className={`lg:w-[${width}]`}>
        <h1 className="text-xl font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center justify-end space-x-2 flex-1">{actions}</div>}
    </div>
  );
};

export default PageTitle;