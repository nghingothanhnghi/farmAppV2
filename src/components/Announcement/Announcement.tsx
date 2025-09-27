import React, { useEffect } from 'react';
import type { IAnnouncementProps, AnnouncementSize } from '../../models/interfaces/IAnnouncement';
import { IconX } from '@tabler/icons-react';
import { playSound } from '../../utils/sound';
import Button from '../common/Button';

const Announcement: React.FC<IAnnouncementProps> = ({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  className = '',
  size = 'md',
}) => {

    // 🔊 Play sound when announcement mounts
  useEffect(() => {
    if (type === 'error') playSound('error');
    else if (type === 'warning' || type === 'info') playSound('alert');
    else if (type === 'success') playSound('success');
  }, [type]);

  let meshBackground = '';

  switch (type) {
    case 'info':
      meshBackground = `
        bg-gradient-to-br from-blue-100 via-sky-200 to-blue-300
        dark:from-blue-950 dark:via-violet-800 dark:to-pink-700
      `;
      break;
    case 'success':
      meshBackground = `
        bg-gradient-to-br from-green-100 via-emerald-200 to-green-300
        dark:from-green-900 dark:via-green-800 dark:to-green-700
      `;
      break;
    case 'warning':
      meshBackground = `
        bg-gradient-to-br from-yellow-100 via-amber-200 to-yellow-300
        dark:from-yellow-900 dark:via-yellow-800 dark:to-yellow-700
      `;
      break;
    case 'error':
      meshBackground = `
        bg-gradient-to-br from-red-100 via-rose-200 to-red-300
        dark:from-red-900 dark:via-red-800 dark:to-red-700
      `;
      break;
    default:
      meshBackground = `
        bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300
        dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700
      `;
      break;
  }

    // 🎯 Define size classes
  const sizeClasses: Record<AnnouncementSize, { container: string; title: string; message: string }> = {
    xxs: {
      container: 'p-2 text-xs',
      title: 'text-sm',
      message: 'text-xs',
    },
    xs: {
      container: 'p-3 text-sm',
      title: 'text-base',
      message: 'text-sm',
    },
    sm: {
      container: 'p-4 text-sm',
      title: 'text-lg',
      message: 'text-sm',
    },
    md: {
      container: 'p-6 text-base',
      title: 'text-xl',
      message: 'text-base',
    },
    lg: {
      container: 'p-8 text-lg',
      title: 'text-2xl',
      message: 'text-lg',
    },
  };

  const { container, title: titleClass, message: messageClass } = sizeClasses[size];

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-md p-4 lg:p-10 mb-4 ${container} ${meshBackground} ${className}`}>
      {/* Optional blurred mesh background layer */}
      <div className="absolute inset-0 -z-10 blur-2xl opacity-30 pointer-events-none" />

      <div className="flex justify-between items-start">
        <div className="text-gray-900 dark:text-gray-100">
          {title && <strong className={`block font-semibold mb-1 ${titleClass}`}>{title}</strong>}
          <div className={`${messageClass} leading-relaxed`}>{message}</div>
        </div>

        {dismissible && (
          <Button
            onClick={onDismiss}
            variant="secondary"
            icon={<IconX size={16} />}
            iconOnly
            label="Close"
            className="bg-transparent"
            rounded='full'
          />
        )}
      </div>
    </div>
  );
};

export default Announcement;
