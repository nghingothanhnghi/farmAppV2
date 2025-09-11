import React, { useState, useEffect } from 'react';
import type { ModalProps } from '../../models/interfaces/Modal';
import { IconX } from '@tabler/icons-react';
import ReactDOM from 'react-dom';
import Button from './Button';

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  actions,
  size = 'medium',
  fullWidth = false,
  fullHeight = false,
  position = 'center',
  variant = 'default',
  sidebarTabs = [],
  activeTab,
  onTabChange,
  showCloseButton = true,
}) => {

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setTimeout(() => setIsAnimating(false), 300); // Wait for animation before removing from DOM
    }
  }, [isOpen]);

  // If the modal is not open, return null (don't render anything)
  if (!isOpen && !isAnimating) return null;

  // Set a dynamic class for the modal size
  const modalSizeClasses = {
    xsmall: 'sm:w-1/2 md:w-1/2 lg:w-1/4 w-full mx-5',
    small: 'sm:w-1/3 w-full mx-5',   // 100% on mobile, 1/3 on small screens
    medium: 'sm:w-3/6 w-full mx-5',  // 100% on mobile, 3/6 on small screens
    large: 'sm:w-4/5 w-full',   // 100% on mobile, 4/5 on small screens
  };

  // Positioning logic
  const positionClasses = {
    center: 'items-center', // Center vertically
    bottom: 'items-end', // Stick to bottom with padding
  };

  return ReactDOM.createPortal(
    <div className={`fixed inset-0 z-40 flex justify-center 
    ${positionClasses[position] || positionClasses.center} bg-white/30 backdrop-blur-sm
    transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
      }
    `}
    >
      <div
        className={`bg-white rounded-3xl border border-gray-300 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-100 shadow-md flex flex-col
        transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          } 
        ${fullWidth ? 'w-full max-w-4/5' : modalSizeClasses[size] || modalSizeClasses.medium} 
        ${fullHeight ? 'h-screen' : 'max-h-[90vh]'} 
        overflow-y-auto`}
      // className={`bg-white rounded-lg p-8 ${modalSizeClasses[size] || modalSizeClasses.medium} flex flex-col`}
      >


        {variant === 'sidebar' ? (
          <div className='flex'>
            {/* Left side (tabs + close) */}
            <div className="w-1/3 p-4 flex flex-col border-r border-gray-200 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <div className='flex justify-between align-middle'>
                <Button
                  variant="secondary"
                  icon={<IconX size={18} />}
                  iconOnly
                  label="Close"
                  className='bg-transparent'
                  onClick={onClose}
                  rounded='full'
                />
              </div>
              <div className="py-5 space-y-2">
                {sidebarTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm
                        ${tab.icon ? 'flex items-center' : ''}
                        ${activeTab === tab.id ? 'bg-white text-black dark:bg-gray-700 dark:text-gray-100' : 'text-gray-700 dark:text-gray-100'}
                      `}
                  >
                    {tab.icon && <span className="mr-2">{tab.icon}</span>} {/* ✅ Render icon */}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Right side (content) */}
            <div className="w-2/3 p-6 flex flex-col min-h-[480px] overflow-y-auto">
              <div className="flex-grow overflow-y-auto text-sm">{content}</div>
              {actions && <div className="mt-6">{actions}</div>}
            </div>
          </div>
        ) : (
          <>
            {(title || showCloseButton) && (
              <div className="py-4 px-10 flex justify-between items-center">
                {title ? (
                  <div className='modal-title text-lg font-semibold'>{title}</div>
                ) : (
                  <div />
                )}
                {showCloseButton && (
                  <Button
                    icon={<IconX size={18} />}
                    iconOnly
                    label="Close"
                    className='bg-transparent'
                    onClick={onClose}
                    rounded='full'
                  />
                )}
              </div>
            )}

            <div className="flex-grow overflow-y-auto mt-4">
              {content}
            </div>
            <div className="py-4 px-10 flex justify-center">
              {actions}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body // Append modal to the body
  );
};

export default Modal;
