// src/components/device/DeviceConnectedList.tsx
import React from 'react';
import { formatDeviceSerial } from '../../../utils/formatters';

interface DeviceConnectedListProps {
    devices: string[];
    layout?: 'vertical' | 'horizontal'; // New prop for layout direction
}

const DeviceConnectedList: React.FC<DeviceConnectedListProps> = ({ devices, layout = 'vertical' }) => {
   
    console.log("DeviceConnectedList devices:", devices);
    
    // Determine grid classes based on layout prop
    const gridClasses = layout === 'horizontal' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1';
    return (
        <div className="bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-700 shadow rounded-lg p-6">
            {/* <h2 className="text-xl font-semibold mb-4">Connected Devices ({devices.length})</h2> */}
            <div className={`grid ${gridClasses} gap-4`}>
                {devices.map((device, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 dark:bg-gray-800/80 dark:border-white/5 shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                    Device {index + 1}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {formatDeviceSerial(device)} {/* Apply the formatter */}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeviceConnectedList;
