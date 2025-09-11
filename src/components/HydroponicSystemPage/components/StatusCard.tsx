// src/components/HydroponicSystemPage/components/StatusCard.tsx
import React from 'react';

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'error';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
  children?: React.ReactNode;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  unit,
  status = 'normal',
  icon,
  trend,
  className,
  children
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return 'border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/30';
      case 'error':
        return 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/30';
      default:
        return 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/30';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500 dark:text-green-300">↗</span>;
      case 'down':
        return <span className="text-red-500 dark:text-red-300">↘</span>;
      case 'stable':
        return <span className="text-gray-500 dark:text-gray-400">→</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()} transition-all duration-200 hover:shadow-md h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</h3>
        {icon && <div className="text-gray-600 dark:text-gray-300">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
          {unit && <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">{unit}</span>}
        </div>
        {getTrendIcon()}
      </div>
      {children}
    </div>
  );
};

export default StatusCard;