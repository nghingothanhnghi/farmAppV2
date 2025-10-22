// src/components/HydroponicSystemPage/components/MultiActuatorControlPanel.tsx
import React, { useEffect } from 'react';
import type { SystemStatusPerDevice, HydroActuator } from '../../../models/interfaces/HydroSystem';
import DropdownButton from '../../common/DropdownButton';
import Badge from '../../common/Badge';
import ActuatorCard from './ActuatorCard';
import { playSound } from '../../../utils/sound';

interface MultiActuatorControlPanelProps {
  systemStatus: SystemStatusPerDevice | null;
  onActuatorControl: (actuatorId: number, turnOn: boolean) => void;
  loading?: boolean;
}

const MultiActuatorControlPanel: React.FC<MultiActuatorControlPanelProps> = ({
  systemStatus,
  onActuatorControl,
  loading = false
}) => {
  console.log('MultiActuatorControlPanel - systemStatus:', systemStatus);

  const handleActuatorControl = (actuatorId: number, turnOn: boolean) => {
    playSound(turnOn ? 'on' : 'off');
    onActuatorControl(actuatorId, turnOn);
  };


  const getActuatorIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'pump':
      case 'water_pump':
        return '💧';
      case 'light':
        return '💡';
      case 'fan':
        return '🌀';
      case 'valve':
        return '🚰';
      default:
        return '⚙️';
    }
  };

  // Group actuators by type for better organization
  const groupedActuators = React.useMemo(() => {
    if (!systemStatus?.actuators) return {};

    return systemStatus.actuators.reduce((groups, actuator) => {
      const type = actuator.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(actuator);
      return groups;
    }, {} as Record<string, HydroActuator[]>);
  }, [systemStatus?.actuators]);

  // State for currently selected type
  const [selectedType, setSelectedType] = React.useState<string | null>(null);

  // When groupedActuators changes, set the default
  useEffect(() => {
    if (!selectedType && Object.keys(groupedActuators).length > 0) {
      setSelectedType(Object.keys(groupedActuators)[0]);
    }
  }, [groupedActuators, selectedType]);

  const typeDropdownItems = Object.keys(groupedActuators).map((type) => ({
    label: `${getActuatorIcon(type)} ${type.replace("_", " ")} (${groupedActuators[type].length})`,
    value: type,
  }));

  return (
    <div className='flex-1 overflow-y-auto space-y-0.5 transition-colors bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]'>
      {/* Summary Stats */}
      {systemStatus?.actuators && systemStatus.actuators.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-900 rounded-t-xl transition-colors">
          <div
            className="
            flex items-center justify-between p-2 
            rounded-t-xl border border-gray-200 dark:border-white/5
            bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800
            shadow dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
          >
            <div className="flex space-x-4 items-center dark:text-gray-200">
              <Badge size="xsmall">
                Total: {systemStatus.actuators.length}
              </Badge>
              <Badge size="xsmall">
                Active: {systemStatus.actuators.filter(a => a.current_state).length}
              </Badge>
              <Badge size="xsmall">
                Enabled: {systemStatus.actuators.filter(a => a.is_active).length}
              </Badge>
            </div>
            <DropdownButton
              label={
                selectedType
                  ? `${selectedType.replace("_", " ")} (${groupedActuators[selectedType].length})`
                  : "Select Actuator Type"
              }
              items={typeDropdownItems}
              onSelect={(item) => setSelectedType(item.value)}
              size='xxs'
              direction='left'
            />
          </div>
        </div>
      )}
      {/* Show only actuators from the selected group */}
      {selectedType && (
        <>
          {groupedActuators[selectedType].map((actuator) => (
            <ActuatorCard
              key={actuator.id}
              actuator={actuator}
              loading={loading}
              variant="control"
              onControl={handleActuatorControl}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default MultiActuatorControlPanel;