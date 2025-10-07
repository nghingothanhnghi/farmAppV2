// src/components/HydroponicSystemPage/components/SensorChart.tsx
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import EmptyState from '../../common/EmptyState';
import noDataAnimation from '../../../assets/lottie/empty_data.json'
import { chartTypeMap } from '../../../models/types/ChartType';
import type { SensorChartProps } from '../../../models/interfaces/SensorChart';


const SensorChart: React.FC<SensorChartProps> = ({
  data,
  type,
  title,
  unit,
  color,
  chartType = 'monotone'
}) => {
  // Check if data is empty or undefined
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-4">{title}</h3>
        <EmptyState
          animationData={noDataAnimation}
          message="No data available for this sensor yet"
        />
      </div>
    );
  }

  const chartData = data
  .filter(d => d[type] !== null && d[type] !== undefined)
  .map(d => ({
    value: d[type],
    time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));



  const currentValue = chartData[chartData.length - 1].value;
  const previousValue = chartData[chartData.length - 2]?.value ?? currentValue;
  const trend = currentValue > previousValue ? 'up' : currentValue < previousValue ? 'down' : 'stable';


  return (

    <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">{title}</h3>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color }}>
            {currentValue?.toFixed(1)} {unit}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            {trend === 'up' && '↗ Rising'}
            {trend === 'down' && '↘ Falling'}
            {trend === 'stable' && '→ Stable'}
          </div>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(1)}`}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)} ${unit}`} />
            <Line
              type={chartTypeMap[chartType]}
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorChart;