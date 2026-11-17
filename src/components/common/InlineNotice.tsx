
import React from 'react';
import Button from './Button';

type NoticeVariant = 'info' | 'success' | 'warning' | 'danger';

interface InlineNoticeProps {
  variant?: NoticeVariant;
  title?: React.ReactNode;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
  };
  className?: string;
}

const VARIANTS: Record<NoticeVariant, string> = {
  info: [
    'border-blue-200 bg-blue-50 text-blue-800',
    'dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  ].join(' '),

  success: [
    'border-green-200 bg-green-50 text-green-800',
    'dark:border-green-800 dark:bg-green-900/20 dark:text-green-200',
  ].join(' '),

  warning: [
    'border-yellow-200 bg-yellow-50 text-yellow-800',
    'dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
  ].join(' '),

  danger: [
    'border-red-200 bg-red-50 text-red-800',
    'dark:border-red-800 dark:bg-red-900/20 dark:text-red-200',
  ].join(' '),
};

const InlineNotice: React.FC<InlineNoticeProps> = ({
  variant = 'info',
  title,
  children,
  action,
  className = '',
}) => {
  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={`rounded-md border p-2 space-y-1 text-sm ${VARIANTS[variant]} ${className}`}
    >
      {title && <p className="font-semibold">{title}</p>}

      <div>{children}</div>

      {action && (
        <Button
            label={action.label}
            type='button'
            variant='link'
            size={action.size ?? 'xs'}
            onClick={action.onClick}
            disabled={action.disabled}
            className="!text-current underline opacity-70"
        />
      )}
    </div>
  );
};

export default InlineNotice;
