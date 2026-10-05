// src/components/billiard/components/StartStopButtons.tsx
import React from 'react';
import { IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import Button from '../../common/Button';
import type { TableStatus } from '../../../models/interfaces/Billiard';

interface Props {
  status: TableStatus | 'stopped';
  busy?: boolean;
  disabled?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  size?: 'xs' | 'sm' | 'md';
  fullWidth?: boolean;
}

/** Start for available tables, Stop for playing ones. Disabled while in flight. */
const StartStopButtons: React.FC<Props> = ({
  status,
  busy = false,
  disabled = false,
  onStart,
  onStop,
  size = 'sm',
  fullWidth = false,
}) => {
  if (status === 'available' && onStart) {
    return (
      <Button
        label={busy ? 'Starting...' : 'Start'}
        icon={<IconPlayerPlay size={16} />}
        iconPosition="left"
        onClick={onStart}
        disabled={busy || disabled}
        size={size}
        rounded="lg"
        fullWidth={fullWidth}
      />
    );
  }
  if (status === 'playing' && onStop) {
    return (
      <Button
        label={busy ? 'Stopping...' : 'Stop'}
        icon={<IconPlayerStop size={16} />}
        iconPosition="left"
        variant="danger"
        onClick={onStop}
        disabled={busy || disabled}
        size={size}
        rounded="lg"
        fullWidth={fullWidth}
      />
    );
  }
  return null;
};

export default StartStopButtons;
