import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

interface DropdownItem {
    label: React.ReactNode;
    value: string;
    icon?: React.ReactNode;
}

type DropdownDirection =
    | 'auto'
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'bottom'
    | 'bottom-left'
    | 'bottom-right'
    | 'left'
    | 'right';
interface DropdownButtonProps {
    label: React.ReactNode;
    items: DropdownItem[];
    onSelect: (item: DropdownItem) => void;
    disabled?: boolean;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
    direction?: DropdownDirection;
    iconOnly?: boolean;
    showArrow?: boolean;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
    label,
    items,
    onSelect,
    disabled = false,
    className = '',
    variant = 'secondary',
    size = 'md',
    direction = 'auto',
    iconOnly = false,
    showArrow = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const [position, setPosition] = useState<DropdownDirection>('bottom');
    const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
        top: 0,
        left: 0,
        width: 0,
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLUListElement>(null);

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    };

    const handleToggle = () => {
        if (!disabled) {
            if (!isOpen) {
                updateCoords();
            }
            setIsOpen((prev) => !prev);
            setFocusedIndex(-1);
        }
    };

    const handleSelect = (item: DropdownItem) => {
        onSelect(item);
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (
            containerRef.current &&
            !containerRef.current.contains(e.target as Node) &&
            dropdownRef.current &&
            !dropdownRef.current.contains(e.target as Node)
        ) {
            setIsOpen(false);
            setFocusedIndex(-1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex((prev) => (prev + 1) % items.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
        } else if (e.key === 'Enter' && focusedIndex >= 0) {
            e.preventDefault();
            handleSelect(items[focusedIndex]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
            setFocusedIndex(-1);
        }
    };

    // Auto-position logic
    useEffect(() => {
        if (isOpen && containerRef.current && dropdownRef.current) {
            if (direction === 'auto') {
                const rect = containerRef.current.getBoundingClientRect();
                const dropdownHeight = dropdownRef.current.offsetHeight;
                const dropdownWidth = dropdownRef.current.offsetWidth;

                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const spaceRight = window.innerWidth - rect.right;
                const spaceLeft = rect.left;

                if (spaceBelow >= dropdownHeight) {
                    if (spaceRight >= dropdownWidth / 2 && spaceLeft >= dropdownWidth / 2) {
                        setPosition('bottom');
                    } else if (spaceRight >= dropdownWidth) {
                        setPosition('bottom-left');
                    } else {
                        setPosition('bottom-right');
                    }
                } else if (spaceAbove >= dropdownHeight) {
                    if (spaceRight >= dropdownWidth / 2 && spaceLeft >= dropdownWidth / 2) {
                        setPosition('top');
                    } else if (spaceRight >= dropdownWidth) {
                        setPosition('top-left');
                    } else {
                        setPosition('top-right');
                    }
                } else if (spaceRight >= dropdownWidth) {
                    setPosition('right');
                } else if (spaceLeft >= dropdownWidth) {
                    setPosition('left');
                } else {
                    setPosition('bottom');
                }
            } else {
                setPosition(direction);
            }
        }
    }, [isOpen, direction]);

    // Recalculate coords on scroll/resize
    useEffect(() => {
        if (!isOpen) return;
        const handleResizeScroll = () => updateCoords();
        window.addEventListener('resize', handleResizeScroll);
        window.addEventListener('scroll', handleResizeScroll, true);
        return () => {
            window.removeEventListener('resize', handleResizeScroll);
            window.removeEventListener('scroll', handleResizeScroll, true);
        };
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative ${className} flex`}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <Button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                className={className}
                variant={variant}
                size={size}
                rounded="lg"
                label={iconOnly ? (typeof label === 'string' ? label : '') : ''}
                iconOnly={iconOnly}
                icon={
                    <div className="flex items-center gap-2">
                        {iconOnly ? (
                            label
                        ) : (
                            <>
                                {label}
                                {showArrow && (
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
                                )}
                            </>
                        )}
                    </div>
                }
            />
            {isOpen &&
                createPortal(
                    <ul
                        ref={dropdownRef}
                        className="z-[9999] min-w-[200px] bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-700 border rounded shadow absolute"
                        style={{
                            top:
                                position.startsWith('top')
                                    ? coords.top - (dropdownRef.current?.offsetHeight ?? 0) - 4
                                    : coords.top,
                            left:
                                position.endsWith('right')
                                    ? coords.left + coords.width - (dropdownRef.current?.offsetWidth ?? 0)
                                    : position.endsWith('left')
                                        ? coords.left
                                        : coords.left + coords.width / 2 - (dropdownRef.current?.offsetWidth ?? 0) / 2,
                            width: coords.width,
                        }}
                    >
                        {items.map((item, index) => (
                            <li
                                key={index}
                                className={`flex items-center px-4 py-2 cursor-pointer text-sm ${index === focusedIndex ? '' : ''
                                    }`}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setFocusedIndex(index)}
                            >
                                {item.icon && <span className="flex-shrink-0 pr-3">{item.icon}</span>}
                                {item.label}
                            </li>
                        ))}
                    </ul>,
                    document.body
                )}
        </div>
    );
};

export default DropdownButton;
