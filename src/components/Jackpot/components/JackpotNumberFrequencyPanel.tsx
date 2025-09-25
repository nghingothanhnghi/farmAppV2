// src/components/Jackpot/components/JackpotRules.tsx
import React, { useState } from 'react';
import JackpotNumberFrequencyChart from './JackpotNumberFrequencyChart';
import JackpotNumberFrequencyGrid from './JackpotNumberFrequencyGrid';
import Spinner from '../../common/Spinner';
import Button from '../../common/Button';
interface NumberFrequency {
    number: number;
    count: number;
}

interface Props {
    hotNumbers: NumberFrequency[];
    coldNumbers: NumberFrequency[];
    loading?: boolean;
    maxNumber?: number;
}

const JackpotNumberFrequencyPanel: React.FC<Props> = ({
    hotNumbers,
    coldNumbers,
    loading = false,
    maxNumber = 55,
}) => {
    const [viewMode, setViewMode] = useState<'chart' | 'grid'>('chart');

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Spinner />
            </div>
        );
    }
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">
                    🔥 Hot & ❄️ Cold Numbers
                </h3>
                <Button
                    label={viewMode === 'chart' ? 'Switch to Grid' : 'Switch to Chart'}
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'chart' ? 'grid' : 'chart')}
                    rounded='lg'
                />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Số xuất hiện gần đây (Hot, đỏ) hoặc ít xuất hiện (Cold, xanh).
            </p>

            {viewMode === 'chart' ? (
                <JackpotNumberFrequencyChart hotNumbers={hotNumbers} coldNumbers={coldNumbers} />
            ) : (
                <JackpotNumberFrequencyGrid
                    hotNumbers={hotNumbers}
                    coldNumbers={coldNumbers}
                    maxNumber={maxNumber}
                />
            )}
        </div>
    );
};

export default JackpotNumberFrequencyPanel;
