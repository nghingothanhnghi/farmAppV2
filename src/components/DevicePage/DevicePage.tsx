/* components/pages/DevicePage.tsx*/
import React, { useState } from 'react';
import DeviceListDemoPage from './DeviceListDemoPage';
import DeviceListNormalPage from './DeviceListNormalPage';

function DevicePage() {
    const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

    const toggleMode = () => {
        setIsDemoMode(!isDemoMode);
    };

    return (
        <React.Fragment>
            {isDemoMode ? (
                <DeviceListDemoPage isDemoMode={isDemoMode} toggleMode={toggleMode} />
            ) : (
                <DeviceListNormalPage isDemoMode={isDemoMode} toggleMode={toggleMode} />
            )}
        </React.Fragment>
    );
}

export default DevicePage;