// src/components/common/LinearProgress.tsx
import React, { useState, useEffect } from 'react';

interface LinearProgressProps {
  position?: 'static' | 'relative' | 'absolute' | 'fixed';
  thickness?: string; // Allows customization of the thickness
  duration?: number; // Duration for the progress bar to fill
  message?: string; // Optional message to display

  
  // 👇 ADD THIS
  value?: number; // 0 → 100
}

const LinearProgress: React.FC<LinearProgressProps> = ({ position = 'relative', thickness = 'h-1', duration = 5000, message, value }) => {
  const [progress, setProgress] = useState(0);

    useEffect(() => {
    // 👉 If value provided → use it directly
    if (value !== undefined) {
      setProgress(value);
      return;
    }

    // 👉 fallback to auto animation
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : 100));
    }, duration / 100);

    return () => clearInterval(interval);
  }, [duration, value]);

  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-900 ${position} start-0 top-0`}>
      <div
        className={`bg-blue-500 dark:bg-blue-400 ${thickness}`}
        style={{ 
          width: `${progress}%`, 
          transition: `width ${duration / 100}ms linear` 
        }}
      ></div>
        {message && <div className="progress-message">{message}</div>}
    </div>
  );
};

export default LinearProgress;
