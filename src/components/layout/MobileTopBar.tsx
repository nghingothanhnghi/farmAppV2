// src/components/layout/MobileTopBar.tsx
import React from 'react';
import { useLocation, matchPath } from 'react-router';
import { IconMenuDeep } from '@tabler/icons-react';
import Button from '../common/Button';

interface MobileTopBarProps {
    onMenuClick: () => void;
}

interface RouteMap {
    pattern: string;
    title: string;
}

// Define your path-to-title mapping
const pathTitleMap: RouteMap[] = [
    { pattern: '/', title: 'Android Device Streaming Demo' },
    { pattern: '/scheduler-health', title: 'Scheduler Health' },
    { pattern: '/ar-detection', title: 'AR Object Detection' },
    { pattern: '/model-training', title: 'Train YOLOv8 Model' },
    { pattern: '/hydroponic-system', title: 'Hydroponic System Dashboard' },
    { pattern: '/projects/:projectId/settings', title: 'Project Settings' },
    { pattern: '/dashboard/products', title: 'Product Management' },
    { pattern: '/dashboard/cms', title: 'CMS Management' },
    // add more routes as needed
];

const MobileTopBar: React.FC<MobileTopBarProps> = ({ onMenuClick }) => {
    const location = useLocation();
    const pathname = location.pathname;

    // Use matchPath properly, match first pattern that applies
    const matched = pathTitleMap.find((route) =>
        matchPath({ path: route.pattern, end: true }, pathname)
    );

    const title = matched?.title || '';

    return (
        <div className="lg:hidden p-4 space-x-4 lg:mb-5 border-b border-zinc-950/5 dark:border-white/5 flex justify-between items-center">
            <Button
                type="button"
                onClick={onMenuClick}
                variant="secondary"
                icon={<IconMenuDeep size={16} />}
                iconOnly
                className="bg-transparent"
                rounded='full'
            />
            {title && (
                <h1 className="text-base font-semibold text-gray-700 dark:text-white truncate text-center flex-1">
                    {title}
                </h1>
            )}
            {/* Right: Invisible button placeholder to balance spacing */}
            <div className="w-[75px]" /> {/* Match the width of the Button */}
        </div>
    );
};

export default MobileTopBar;
