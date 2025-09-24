// src/components/HydroponicSystemPage/components/ActivityLog.tsx
import React from 'react';
import type { ControlAction } from '../../../models/interfaces/HydroSystem';
import { IconMoodEmpty } from '@tabler/icons-react';
import EmptyState from '../../common/EmptyState';

interface ActivityLogProps {
  actions: ControlAction[];
  className?: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ actions, className }) => {
  const getActionIcon = (action: string, success: boolean) => {
    if (!success) return '❌';

    if (action.includes('Pump')) {
      return action.includes('ON') ? '🟢' : '🔴';
    }
    if (action.includes('Scheduler')) return '⏰';
    if (action.includes('Threshold')) return '⚙️';
    return '📝';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-6 ${className}`}
    >
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Activity Log</h2>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {actions.length === 0 ? (
          <EmptyState
            icon={<IconMoodEmpty size={48} />}
            message="No recent activity"
          />
        ) : (
          actions.map((action, index) => (
            <div
              key={`${action.timestamp}-${index}`}
              className={`p-3 rounded-lg border transition-all duration-200 ${action.success
                ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                : 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg">
                  {getActionIcon(action.action, action.success)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {action.action}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${action.success
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                      {action.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  {action.message && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {action.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(action.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {actions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing last {Math.min(actions.length, 10)} actions
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;