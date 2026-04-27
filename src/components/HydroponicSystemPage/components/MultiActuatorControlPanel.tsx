// src/components/HydroponicSystemPage/components/MultiActuatorControlPanel.tsx
import React from 'react';
import type { SystemStatusPerDevice, HydroActuator } from '../../../models/interfaces/HydroSystem';
import DropdownButton from '../../common/DropdownButton';
import Badge from '../../common/Badge';
import ActuatorCard from './ActuatorCard';
import { playSound } from '../../../utils/sound';
import { getActuatorIcon } from '../../../utils/actuator';

interface MultiActuatorControlPanelProps {
  systemStatus: SystemStatusPerDevice | null;
  onManualModeChange: (actuatorId: number, state: boolean | null) => void;
  loading?: boolean;
}

const MultiActuatorControlPanel: React.FC<MultiActuatorControlPanelProps> = ({
  systemStatus,
  onManualModeChange,
  loading = false
}) => {

  console.log('MultiActuatorControlPanel - systemStatus:', systemStatus);

  const handleManualModeChange = (
  actuatorId: number,
  state: boolean | null
) => {
  if (state === true) playSound('on');
  else if (state === false) playSound('off');

  onManualModeChange(actuatorId, state);
};

  // 📦 Group actuators by type (pump, light, fan...)
  // This helps for filtering + dropdown display
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

  // 🎯 Selected filter type
  // default = "all" → show all actuators
  const [selectedType, setSelectedType] = React.useState<string>("all");

  // 📋 Build dropdown items:
  // - first item = "All"
  // - then dynamic actuator types
  const typeDropdownItems = [
    {
      value: "all",
      label: (
        <div className="flex items-center gap-2">
          <span>🌐</span>
          <span>All ({systemStatus?.actuators.length || 0})</span>
        </div>
      ),
    },
    // 🔁 Map each actuator type into dropdown option
    ...Object.keys(groupedActuators).map((type) => {
      const { Icon, color } = getActuatorIcon(type);

      return {
        value: type,
        label: (
          <div className="flex items-center gap-2">
            <Icon size={14} className={color} />
            <span>
              {type.replace("_", " ")} ({groupedActuators[type].length})
            </span>
          </div>
        ),
      };
    }),
  ];

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
                selectedType === "all"
                  ? (
                    // 🌐 Show "All" label
                    <div className="flex items-center gap-2">
                      <span>🌐</span>
                      <span>All ({systemStatus?.actuators.length || 0})</span>
                    </div>
                  )
                  : (() => {
                    // 🎯 Show selected type with icon
                    const { Icon, color } = getActuatorIcon(selectedType);
                    return (
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={color} />
                        <span>
                          {selectedType.replace("_", " ")} ({groupedActuators[selectedType].length})
                        </span>
                      </div>
                    );
                  })()
              }
              items={typeDropdownItems}
              // 🔁 Update selected filter
              onSelect={(item) => setSelectedType(item.value)}
              size='xxs'
              direction='left'
            />
          </div>
        </div>
      )}

      {/* 🧠 Main render logic */}
      {/* If "all" → show everything */}
      {/* Else → show only selected group */}
      {selectedType === "all"
        ? systemStatus?.actuators.map((actuator) => (
          <ActuatorCard
            key={actuator.id}
            actuator={actuator}
            loading={loading}
            variant="control"
            onManualModeChange={handleManualModeChange}
          />
        ))
        : groupedActuators[selectedType]?.map((actuator) => (
          <ActuatorCard
            key={actuator.id}
            actuator={actuator}
            loading={loading}
            variant="control"
            onManualModeChange={handleManualModeChange}
          />
        ))
      }
    </div>
  );
};

export default MultiActuatorControlPanel;