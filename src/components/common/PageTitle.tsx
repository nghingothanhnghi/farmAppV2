// src/components/common/PageTitle.tsx
import React from 'react';
import type { PageTitleProps } from '../../models/interfaces/PageTitle';


const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="hidden lg:flex flex-col sm:flex-row items-start justify-between gap-4 mb-5">
      <div className='lg:w-[500px]'>
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