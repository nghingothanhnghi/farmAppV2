import React, { useEffect, useState, useRef } from 'react';
import Button from './Button';

interface Option {
    label: string;
    value: string;
    disabled?: boolean;
    checked?: boolean;
}

interface MultiSelectDropdownProps {
    options: Option[];
    title?: string;
    disabled?: boolean;
    onChange?: (selected: string[]) => void;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    options,
    title = 'Permissions',
    disabled,
    size = 'md',
    onChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [selectedValues, setSelectedValues] = useState<string[]>(() =>
        options.filter((o) => o.checked).map((o) => o.value)
    );

    const toggleDropdown = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const handleToggleOption = (value: string) => {
        const newSelected = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];

        setSelectedValues(newSelected);
        onChange?.(newSelected);
    };

    useEffect(() => {
        // If parent sends new options, update selected
        setSelectedValues(options.filter((o) => o.checked).map((o) => o.value));
    }, [options]);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 4,
                left: rect.left
            });
        }
    }, [isOpen]);

    const dropdownContent = (
        <div className="z-50 fixed w-64 max-h-72 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 border"
            style={{ top: position.top, left: position.left }}
        >
            <ul>
                {options.map((option, idx) => (
                    <li key={idx} className="gap-2 flex items-center px-4 py-2 cursor-pointer text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-900 hover:bg-gray-200">
                        <input
                            type="checkbox"
                            checked={selectedValues.includes(option.value)}
                            disabled={option.disabled}
                            onChange={() => handleToggleOption(option.value)}
                            className="accent-blue-500 cursor-pointer"
                        />
                        <span
                            className={`text-sm ${option.disabled ? 'text-gray-400 line-through' : ''}`}
                        >
                            {option.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="relative inline-block text-left">
            <Button
                type="button"
                variant='secondary'
                size={size}
                onClick={toggleDropdown}
                disabled={disabled}
                label=""
                rounded='lg'
                icon={
                    <div className="flex items-center gap-2">
                        {title}
                        <svg
                            className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                }
            />
            {isOpen && dropdownContent}
        </div>
    );
};

export default MultiSelectDropdown;
