import React from 'react';

interface WaterLevelBucketProps {
  level: number; // from 0 to 100
}

const WaterLevelBucket: React.FC<WaterLevelBucketProps> = ({ level }) => {
  const clampedLevel = Math.max(0, Math.min(100, level)); // ensure 0–100

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="w-24 h-28 border-2 bg-gray-100 border-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-700 rounded-b-full overflow-hidden relative shadow-inner">
        <div
          className="absolute bottom-0 w-full bg-blue-400 transition-all duration-700 ease-in-out"
          style={{ height: `${clampedLevel}%` }}
        />
      </div>
      <div className="text-center text-[0.625rem] text-gray-600 dark:text-gray-400">
        Water Level: {clampedLevel.toFixed(1)}%
      </div>
    </div>
  );
};

export default WaterLevelBucket;
