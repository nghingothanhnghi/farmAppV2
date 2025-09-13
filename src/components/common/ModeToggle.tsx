import React from 'react';

type ModeToggleProps = {
  isActive: boolean;
  onToggle: () => void;
  currentLabel: string;
  nextLabel: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'normal';
};

const sizeClasses = {
  small: {
    container: 'text-xs px-2 py-1 gap-2 text-xs',
    toggle: 'w-8 h-4',
    knob: 'w-3 h-3',
    knobOffset: 'top-[2px] left-[5px]',
  },
  medium: {
    container: 'text-sm px-3 py-2 gap-3 text-sm',
    toggle: 'w-10 h-5',
    knob: 'w-4 h-4',
    knobOffset: 'top-0.5 left-0.5',
  },
  normal: {
    container: 'text-base px-4 py-3 gap-5 text-base',
    toggle: 'w-12 h-6',
    knob: 'w-5 h-5',
    knobOffset: 'top-0.5 left-0.5',
  },
};

const ModeToggle: React.FC<ModeToggleProps> = ({
  isActive,
  onToggle,
  currentLabel,
  nextLabel,
  disabled = false,
  size = 'small',
}) => {

  const sizeClass = sizeClasses[size];

  return (
    <label
      onClick={() => {
        if (!disabled) onToggle();
      }}
      className={`flex items-center justify-between rounded-xl border transition-all 
        ${sizeClass.container} 
        ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white dark:border-zinc-600 dark:bg-zinc-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow cursor-pointer'}
      `}
    >
      <span className="text-zinc-500 dark:text-zinc-400 min-w-[36px] max-w-[44px] truncate overflow-hidden whitespace-nowrap">{currentLabel}</span>
      <div className='flex items-center justify-between gap-2'>
        <div
          className={`relative rounded-full transition-colors duration-300 
          ${sizeClass.toggle} 
          ${isActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-zinc-500'}
        `}
        >
          <div
            className={`absolute rounded-full bg-white dark:bg-zinc-100 transition-transform duration-300 ease-in-out 
            ${sizeClass.knob} ${sizeClass.knobOffset}
            ${isActive ? 'translate-x-full' : 'translate-x-0'}
          `}
          />
        </div>
        <input
          type="checkbox"
          className="sr-only"
          checked={isActive}
          onChange={() => { }}
          disabled={disabled}
        />
      </div>
      <span className="text-gray-900 dark:text-white min-w-[40px] max-w-[70px] truncate overflow-hidden whitespace-nowrap">{nextLabel}</span>
    </label>
  );
};

export default ModeToggle;
