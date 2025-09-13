import React from 'react';
import Lottie from 'lottie-react';
import type { EmptyStateProps } from '../../models/interfaces/EmptyState';

const EmptyState: React.FC<EmptyStateProps> = ({
  animationData,
  imageSrc,
  icon,
  message,
  height = 150,
  width = 150,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 space-y-4 h-48">
      {animationData ? (
        <Lottie animationData={animationData} loop autoplay style={{ height, width }} />
      ) : imageSrc ? (
        <img src={imageSrc} alt="Empty" style={{ height, width }} className="object-contain opacity-80" />
      ) : icon ? (
        <div className="text-gray-400 dark:text-gray-500" style={{ fontSize: width * 0.6 }}>
          {icon}
        </div>
      ) : null}

      <p className="text-sm mb-6">{message}</p>
    </div>
  );
};

export default EmptyState;
