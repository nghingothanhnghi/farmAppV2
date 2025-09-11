import React from 'react';
import type { LocationStatusResponse } from '../../../models/interfaces/HardwareDetection';

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
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700">
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
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-300",
    },
    {
      key: "total_detected",
      label: "Total Detected",
      value: status.total_detected,
      bg: "bg-green-50 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-300",
    },
    {
      key: "validated_count",
      label: "Validated",
      value: status.validated_count,
      bg: "bg-purple-50 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-300",
    },
    {
      key: "avg_confidence",
      label: "Avg Confidence",
      value: status.detection_confidence_avg
        ? `${(status.detection_confidence_avg * 100).toFixed(1)}%`
        : "N/A",
      bg: "bg-yellow-50 dark:bg-yellow-900/30",
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
        <div key={card.key} className={`${card.bg} p-4 rounded-lg`}>
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
