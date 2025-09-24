import React from 'react';
import type { LocationStatusResponse } from '../../../models/interfaces/HardwareDetection';
import Spinner from '../../common/Spinner';

interface LocationStatusOverviewProps {
  status?: LocationStatusResponse | null;
  loading?: boolean;
  displayOptions?: Array<
    "total_expected" | "total_detected" | "validated_count" | "avg_confidence"
  >;
  columns?: 1 | 2 | 3 | 4;
}

const LocationStatusOverview: React.FC<LocationStatusOverviewProps> = ({
  status,
  loading,
  displayOptions = ["total_expected", "total_detected", "validated_count", "avg_confidence"], // default: show all
   columns = 2,
}) => {
  if (!status) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <Spinner size={32} />
        <p className="text-gray-700 dark:text-gray-300 text-center mt-2">
          {loading
            ? "Loading location status..."
            : "No location status data available. Click \"Refresh Data\" to load."}
        </p>
      </div>
    );
  }

  const cards = [
    {
      key: "total_expected",
      label: "Total Expected",
      value: status.total_expected,
      bg: "bg-blue-50 border border-blue-200 dark:bg-gray-800 dark:border-white/5 bg-gradient-to-b from-blue-50 to-blue-100 shadow dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] dark:from-blue-950 dark:to-blue-900/30",
      text: "text-blue-600 dark:text-blue-300",
    },
    {
      key: "total_detected",
      label: "Total Detected",
      value: status.total_detected,
      bg: "bg-green-50 border border-green-200 dark:bg-gray-800 dark:border-white/5 bg-gradient-to-b from-green-50 to-green-100 shadow dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] dark:from-green-950 dark:to-green-900/30",
      text: "text-green-600 dark:text-green-300",
    },
    {
      key: "validated_count",
      label: "Validated",
      value: status.validated_count,
      bg: "bg-purple-50 border border-purple-200 dark:bg-gray-800 dark:border-white/5 bg-gradient-to-b from-purple-50 to-purple-100 shadow dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] dark:from-purple-950 dark:to-purple-900/30",
      text: "text-purple-600 dark:text-purple-300",
    },
    {
      key: "avg_confidence",
      label: "Avg Confidence",
      value: status.detection_confidence_avg
        ? `${(status.detection_confidence_avg * 100).toFixed(1)}%`
        : "N/A",
      bg: "bg-yellow-50 border border-yellow-200 dark:bg-gray-800 dark:border-white/5 bg-gradient-to-b from-yellow-50 to-yellow-100 shadow dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] dark:from-yellow-950 dark:to-yellow-900/30",
      text: "text-yellow-600 dark:text-yellow-300",
    },
  ];

    // Filter cards based on display options
  const visibleCards = cards.filter((card) =>
    displayOptions.includes(card.key as any)
  );

  // Dynamic responsive grid classes
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
  }[columns];

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {visibleCards.map((card) => (
        <div key={card.key} className={`${card.bg} p-4 rounded-lg transition-all duration-300`}>
          <h3 className={`text-sm font-medium ${card.text.replace("600", "900")}`}>
            {card.label}
          </h3>
          <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default LocationStatusOverview;
