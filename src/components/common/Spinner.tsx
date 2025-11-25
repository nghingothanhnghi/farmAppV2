import React from 'react';

interface SpinnerProps {
  size?: number;
  colorClass?: string;
  borderClass?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 32,
  colorClass = 'border-blue-700',
  borderClass = 'border-b-2',
  className = '',
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full ${borderClass} ${colorClass}`}
        style={{ width: size, height: size }}
      ></div>
    </div>
  );
};

export default Spinner;
