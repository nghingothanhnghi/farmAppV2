import React from 'react';
import IconMap from '../../../assets/icons/map-icon.svg'

interface LocationPanelProps {
  title?: string;
  description?: string;
  imageUrl?: string;
}

const LocationPanel: React.FC<LocationPanelProps> = ({ title, description, imageUrl }) => {
  return (
    <div className="w-full flex flex-row-reverse items-start gap-4 p-4 bg-gray-100 border border-gray-100 dark:bg-gray-900 dark:border-white/5 rounded-lg min-h-[6rem]">
      <img
        alt={title}
        src={imageUrl || IconMap}
        className="w-20 rounded-lg object-cover p-2 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      />
      <div className='flex-1'>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 line-clamp-1">{title}</h3>

        <p className="text-[0.625rem] mt-0.5 text-gray-700 dark:text-gray-400 line-clamp-3">
          {description}
        </p>
      </div>
    </div>
  );
};

export default LocationPanel;
