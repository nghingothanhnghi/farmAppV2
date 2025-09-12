import React from 'react';

type BadgeProps = {
  label?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  className?: string;
  children?: React.ReactNode;
};

const variantClasses = {
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const sizeClasses = {
  xsmall: 'text-[10px] px-1.5 py-[1px]',
  small: 'text-xs px-2 py-0.5',
  medium: 'text-sm px-3 py-1',
  large: 'text-base px-4 py-1.5',
};

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'gray',
  size = 'small',
  className = '',
  children,
}) => {
  const variantClass = variantClasses[variant] || variantClasses.gray;
  const sizeClass = sizeClasses[size] || sizeClasses.small;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClass} ${sizeClass} ${className}`}
    >
      {children || label}
    </span>
  );
};

export default Badge;
