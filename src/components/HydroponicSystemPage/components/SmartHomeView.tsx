// src/components/HydroponicSystemPage/components/SmartHomeView.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { IconHome2, IconChevronUp, IconChevronDown, IconPlayerStop, IconArtboard } from '@tabler/icons-react';
import { useHydroSystem } from '../../../hooks/useHydroSystem';
import useHasAnyRole from '../../../hooks/useHasAnyRole';
import { getActuatorIcon } from '../../../utils/actuator';
import { FormToggle } from '../../common/Form';
import Button from '../../common/Button';
import DropdownButton from '../../common/DropdownButton';
import Spinner from '../../common/Spinner';
import type { HydroActuator, SystemStatusPerDevice } from '../../../models/interfaces/HydroSystem';

interface SmartHomeViewProps {
  /** Optional — pick a specific device. Defaults to the first device found. */
  deviceId?: number;
  /** Roles allowed to actually control actuators. Reuses existing role system. */
  allowedRoles?: string[];
}

const DEFAULT_CONTROL_ROLES = ['admin', 'super_admin', 'moderator', 'user'];

const SmartHomeView: React.FC<SmartHomeViewProps> = ({
  deviceId,
  allowedRoles = DEFAULT_CONTROL_ROLES,
}) => {
  const { deviceStatusList, loading, actions } = useHydroSystem();

  // ✅ Reuse existing role/permission hook — no new permission system
  const canControl = useHasAnyRole(allowedRoles);

  // Local selection state — starts from the prop/route param, falls back to first device
  const [activeDeviceId, setActiveDeviceId] = useState<number | null>(deviceId ?? null);

  useEffect(() => {
    if (deviceId) {
      setActiveDeviceId(deviceId);
    } else if (!activeDeviceId && deviceStatusList.length > 0) {
      setActiveDeviceId(deviceStatusList[0].device_id);
    }
  }, [deviceId, deviceStatusList, activeDeviceId]);

  const device: SystemStatusPerDevice | null = useMemo(() => {
    if (!deviceStatusList.length) return null;
    return (
      deviceStatusList.find((d) => d.device_id === activeDeviceId) ?? deviceStatusList[0]
    );
  }, [deviceStatusList, activeDeviceId]);

  // sliding_door has its own UP/STOP/DOWN controls, excluded from the simple on/off master switch
  const controllableActuators = useMemo(
    () => (device?.actuators || []).filter((a) => a.type !== 'sliding_door'),
    [device]
  );

  const allOn =
    controllableActuators.length > 0 && controllableActuators.every((a) => a.current_state);

  const handleMasterToggle = (checked: boolean) => {
    if (!canControl) return;
    controllableActuators.forEach((a) => {
      actions.setActuatorManualMode(a.id, checked);
    });
  };

  const handleToggle = (actuator: HydroActuator, checked: boolean) => {
    if (!canControl) return;
    actions.setActuatorManualMode(actuator.id, checked);
  };

  const handleSlidingDoor = (actuator: HydroActuator, direction: 'up' | 'stop' | 'down') => {
    if (!canControl) return;
    if (direction === 'stop') {
      actions.stopActuator(actuator.id);
    } else {
      actions.setActuatorManualMode(actuator.id, direction === 'up');
    }
  };

  if (loading && !device) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-20 text-sm text-gray-500 dark:text-gray-400">
        No devices found for this location.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header — location name + device switcher + master switch */}
      <div className="flex items-center justify-between px-1 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <IconHome2 size={22} className="text-gray-500 dark:text-gray-400 shrink-0" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
            {device.location || device.device_name}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* ✅ Device switcher — same pattern as HydroponicSystemPage */}
          {deviceStatusList.length > 1 && (
            <DropdownButton
              label={
                <div className="flex items-center gap-2">
                  <IconArtboard size={16} />
                  <span className="hidden sm:inline">
                    {device.device_name || `Device ${device.device_id}`}
                  </span>
                </div>
              }
              items={deviceStatusList.map((d) => ({
                label: d.device_name || `Device ID ${d.device_id}`,
                value: d.device_id.toString(),
              }))}
              onSelect={(item) => setActiveDeviceId(Number(item.value))}
              size="sm"
              className="bg-transparent"
            />
          )}

          {canControl ? (
            <FormToggle
              id="master-switch"
              checked={allOn}
              onChange={(e) => handleMasterToggle(e.target.checked)}
            />
          ) : (
            <span className="text-xs text-gray-400">Read only</span>
          )}
        </div>
      </div>

      {/* Body — responsive card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {device.actuators.map((actuator) => {
          const { Icon, color } = getActuatorIcon(actuator.type);
          const isSlidingDoor = actuator.type === 'sliding_door';
          const isActive = actuator.current_state;

          return (
            <div
              key={actuator.id}
              className={`
                rounded-2xl p-4 flex flex-col justify-between aspect-square
                border border-gray-100 dark:border-white/5 shadow-sm transition-colors
                ${isActive
                  ? 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-900'
                  : 'bg-white dark:bg-gray-900'}
              `}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-white/70 dark:bg-white/10' : 'bg-gray-100 dark:bg-gray-800'}
                  `}
                >
                  <Icon size={20} className={isActive ? color : 'text-gray-400'} />
                </div>

                {!isSlidingDoor && (
                  <FormToggle
                    id={`toggle-${actuator.id}`}
                    checked={isActive}
                    onChange={(e) => handleToggle(actuator, e.target.checked)}
                    className={!canControl ? 'opacity-50 pointer-events-none' : ''}
                  />
                )}
              </div>

              <div className="mt-2">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {actuator.name}
                </p>
                <p className={`text-xs ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                  {isActive ? 'On' : 'Off'}
                </p>
              </div>

              {/* sliding_door special control */}
              {isSlidingDoor && (
                <div className="flex items-center justify-between gap-1 mt-3">
                  <Button
                    icon={<IconChevronUp size={14} />}
                    iconOnly
                    label="Up"
                    variant="secondary"
                    size="xs"
                    rounded="full"
                    disabled={!canControl}
                    onClick={() => handleSlidingDoor(actuator, 'up')}
                  />
                  <Button
                    icon={<IconPlayerStop size={14} />}
                    iconOnly
                    label="Stop"
                    variant="secondary"
                    size="xs"
                    rounded="full"
                    disabled={!canControl}
                    onClick={() => handleSlidingDoor(actuator, 'stop')}
                  />
                  <Button
                    icon={<IconChevronDown size={14} />}
                    iconOnly
                    label="Down"
                    variant="secondary"
                    size="xs"
                    rounded="full"
                    disabled={!canControl}
                    onClick={() => handleSlidingDoor(actuator, 'down')}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartHomeView;