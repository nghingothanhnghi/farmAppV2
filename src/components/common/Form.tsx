import React, { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  className?: string;
}

const Form: React.FC<FormProps> = ({ onSubmit, children, className = '' }) => {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
};

interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`form-group ${className}`}>
      {children}
    </div>
  );
};

interface FormLabelProps {
  htmlFor: string;
  children: ReactNode;
  className?: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({ htmlFor, children, className = 'dark:text-gray-100' }) => {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
};

interface FormInputProps {
  name?: string;
  type: string;
  id: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  disabled?: boolean;
  className?: string;
  accept?: string;
  multiple?: boolean;
  ref?: React.RefObject<HTMLInputElement>;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  type,
  id,
  value,
  onChange,
  placeholder = '',
  required = false,
  min,
  max,
  step,
  disabled = false,
  className = 'w-full max-w-sm min-w-[200px] ',
  accept,
  multiple = false,
  ref
}) => {
  return (
    <div className={`${className}`}>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`w-full bg-transparent dark:bg-gray-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-700 border border-slate-200 dark:border-gray-700 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 dark:focus:border-gray-500 hover:border-slate-300 dark:hover:border-gray-600 shadow-sm focus:shadow [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none`}
        accept={accept}
        multiple={multiple}
        ref={ref}
      />
    </div>

  );
};

interface FormSelectProps {
  id: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  id,
  value,
  onChange,
  children,
  disabled = false,
  className = ''
}) => {
  return (
    <div className="w-full max-w-sm min-w-[200px]">
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full bg-transparent dark:bg-gray-800 dark:text-gray-100 placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 dark:border-gray-700 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 dark:focus:border-gray-500 hover:border-slate-400 dark:hover:border-gray-600 shadow-sm focus:shadow-md appearance-none cursor-pointer ${className}`}
        >
          {children}
        </select>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="h-5 w-5 ml-1 absolute top-2 right-2.5 text-slate-700 dark:text-gray-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
      </div>
    </div>
  );
};

interface FormCodeInputProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FormCodeInput: React.FC<FormCodeInputProps> = ({
  id,
  value,
  onChange,
  length = 6,
  autoFocus = false,
  disabled = false,
  className = ''
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [codeArray, setCodeArray] = React.useState<string[]>(Array(length).fill(''));

useEffect(() => {
  const filled = Array(length).fill('').map((_, i) => value[i] || '');
  setCodeArray(filled);
}, [value, length]);


  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const updateCode = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const newCode = [...codeArray];
    newCode[index] = val;
    setCodeArray(newCode);
    onChange(newCode.join(''));
    if (val && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (codeArray[index]) {
        updateCode(index, '');
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight') {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const filled = Array(length).fill('').map((_, i) => pasted[i] || '');
    setCodeArray(filled);
    onChange(filled.join(''));
    const nextEmpty = filled.findIndex(c => c === '');
    if (nextEmpty >= 0) inputsRef.current[nextEmpty]?.focus();
  };

  return (
    <div id={id} className={`flex gap-2 justify-center ${className}`}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={codeArray[i]}
          onChange={e => updateCode(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-10 h-12 text-center text-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
        />
      ))}

    </div>
  );
};


interface FormActionsProps {
  children: ReactNode;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({ children, className = '' }) => {
  return (
    <div className={`form-actions ${className}`}>
      {children}
    </div>
  );
};

interface FormToggleProps {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
}

export const FormToggle: React.FC<FormToggleProps> = ({
  id,
  checked,
  onChange,
  label,
  className = ''
}) => {
  return (
    <label
      htmlFor={id}
      className={`relative block h-4 w-8 rounded-full bg-gray-300 transition-colors [-webkit-tap-highlight-color:_transparent] has-checked:bg-green-500 ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="absolute inset-y-0 start-0 m-0.5 h-3 w-3 rounded-full bg-white dark:bg-gray-700 transition-[inset-inline-start] peer-checked:start-4" />
      {label && (
        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 absolute top-1.5 left-16">
          {label}
        </span>
      )}
    </label>
  );
};


export default Form;