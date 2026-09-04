// src/components/HydroponicSystemPage/components/SmartHomeViewWithParam.tsx
import React from 'react';
import { useParams } from 'react-router';
import SmartHomeView from './SmartHomeView';

const SmartHomeViewWithParam: React.FC = () => {
  const { deviceId } = useParams();
  return <SmartHomeView deviceId={deviceId ? Number(deviceId) : undefined} />;
};

export default SmartHomeViewWithParam;