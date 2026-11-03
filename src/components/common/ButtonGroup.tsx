import React, { isValidElement, cloneElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

interface ButtonGroupProps {
  children: ReactNode;
  vertical?: boolean;
  className?: string;
  shadow?: 'none' | 'soft' | 'raised' | 'blue' | 'cyan' | 'colored';
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  vertical = false,
  className = '',
  shadow = 'none',
}) => {
  const childArray = React.Children.toArray(children).filter(isValidElement) as ReactElement<any>[];

  const total = childArray.length;
  const layoutClass = vertical ? 'flex-col' : 'flex-row';

  const shadowStyles = {
    none: '',
    soft: `
      shadow-[0_4px_10px_-3px_rgba(15,23,42,0.25)]
      dark:shadow-[0_4px_10px_-3px_rgba(0,0,0,0.5)]
    `,
    raised: `
      shadow-[0_5px_8px_-2px_rgba(15,23,42,0.3),0_10px_18px_-6px_rgba(15,23,42,0.25)]
      hover:shadow-[0_8px_12px_-2px_rgba(15,23,42,0.35),0_14px_24px_-6px_rgba(15,23,42,0.3)]
      hover:-translate-y-0.5
      active:translate-y-0
      dark:shadow-[0_5px_12px_-3px_rgba(0,0,0,0.7)]
    `,
    blue: `
      shadow-[0_5px_12px_-3px_rgba(37,99,235,0.6),0_8px_20px_-5px_rgba(37,99,235,0.35)]
      hover:shadow-[0_8px_18px_-3px_rgba(37,99,235,0.7)]
    `,
    cyan: `
      shadow-[0_5px_12px_-3px_rgba(6,182,212,0.55),0_8px_20px_-5px_rgba(6,182,212,0.35)]
      hover:shadow-[0_8px_18px_-3px_rgba(6,182,212,0.65)]
    `,
    colored: `
      shadow-[0_5px_12px_-3px_rgba(0,0,0,0.3)]
      hover:shadow-[0_8px_16px_-3px_rgba(0,0,0,0.4)]
    `,
  };

  const modifiedChildren = childArray.map((child, index) => {
    let roundedClass = '';

    if (total === 1) {
      roundedClass = 'rounded-lg';
    } else if (index === 0) {
      roundedClass = vertical ? 'rounded-t-lg' : 'rounded-l-lg';
    } else if (index === total - 1) {
      roundedClass = vertical ? 'rounded-b-lg' : 'rounded-r-lg';
    } else {
      roundedClass = 'rounded-none';
    }

    const childClassName = child.props.className || '';

    return cloneElement(child, {
      className: `${childClassName} ${roundedClass}`.trim(),
    });
  });

  return (
    <div className={`
          inline-flex 
          rounded-lg isolate
          transition-all duration-200
          ${layoutClass} 
          ${className}
          ${shadowStyles[shadow]}
        `}
    >
      {modifiedChildren}
    </div>
  );
};

export default ButtonGroup;
