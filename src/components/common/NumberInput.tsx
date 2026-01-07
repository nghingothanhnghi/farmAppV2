import React from 'react';
import { FormInput } from './Form'; // Adjust the path if needed
import { IconPlus, IconMinus } from '@tabler/icons-react';
import Button from './Button'; // Adjust the path if needed

interface NumberInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  id,
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  disabled = false,
  className = ''
}) => {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(Math.min(max, Math.max(min, newValue)));
    } else if (e.target.value === '') {
      onChange(0);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        icon={<IconMinus size={16} />}
        variant="secondary"
        iconOnly
        label="Decrease"
        rounded='full'
        className='bg-transparent'
      />

      <FormInput
        type="number"
        id={id}
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="text-center w-16"
      />

      <Button
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        icon={<IconPlus size={16} />}
        variant="secondary"
        iconOnly
        label="Increase"
        rounded='full'
        className='bg-transparent'
      />
    </div>
  );
};

export default NumberInput;
