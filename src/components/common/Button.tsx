import React from 'react';

interface ButtonProps {
  label?: string;
  onClick?: () => void;
  onMouseEnter?: () => void; // ✅ add this
  onMouseLeave?: () => void; // ✅ add this
  variant?: 'primary' | 'secondary' | 'danger' | 'link' | 'dark' | 'outline';
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'sm' | 'md' | 'lg'; 
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  onMouseEnter,
  onMouseLeave,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left',
  iconOnly = false,
  size = 'md',
  rounded,
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium focus:outline-none transition-colors gap-2';

  const sizeStyles = {
    xxs: 'text-[10px] py-1 px-2',
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',     // default
    lg: 'text-lg px-5 py-3',
  };

    const iconOnlySizeStyles = {
    xxs: 'w-5 h-5 text-[10px] px-1',
    xs: 'w-6 h-6 text-xs p-1',
    sm: 'w-8 h-8 text-sm p-1.5',
    md: 'w-10 h-10 text-base p-2',
    lg: 'w-12 h-12 text-lg p-3',
  };


  const variantStyles = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-300 dark:bg-transparent dark:text-gray-100 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    link: 'bg-transparent text-blue-600 hover:underline p-0 dark:text-blue-400',
    dark: 'bg-gray-800 text-white hover:bg-black dark:bg-gray-900 dark:hover:bg-black',
    outline:`bg-transparent border border-slate-200 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800`,
  };

  const roundedStyles = {
    full: 'rounded-full',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
  };

  const shapeClass =
  rounded !== undefined
    ? roundedStyles[rounded]
    : iconOnly
    ? '' // Let ButtonGroup apply rounded if needed
    : ''; // Also blank for normal buttons if no rounded specified


  const widthStyles = fullWidth ? 'w-full' : '';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const iconOnlyStyles = iconOnly ? 'justify-center items-center gap-0' : '';

    const sizeClass = iconOnly
    ? iconOnlySizeStyles[size || 'md']
    : variant === 'link'
    ? 'text-sm'
    : sizeStyles[size || 'md'];

  return (
    <button
      type={type}
      className={`${baseStyles} ${shapeClass} ${variantStyles[variant]} ${sizeClass} ${widthStyles} ${disabledStyles} ${iconOnlyStyles} ${className}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      title={iconOnly && typeof label === 'string' ? label : undefined}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      {!iconOnly && label}
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
};

export default Button;