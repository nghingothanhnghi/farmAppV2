import React from 'react';
import { IconCalendarTime } from '@tabler/icons-react';
import ButtonGroup from '../../common/ButtonGroup';
import Button from '../../common/Button';
import { playSound } from '../../../utils/sound';
interface SchedulerControlPanelProps {
  schedulerState: boolean | undefined | null;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  loading?: boolean;
  // optionally supply a short title or show additional info
  title?: string;
  summary?: string;
}

const SchedulerControlPanel: React.FC<SchedulerControlPanelProps> = ({
  schedulerState,
  onStart,
  onStop,
  onRestart,
  loading = false,
  title = 'System Automation',
  summary = 'Automated control based on sensor readings and thresholds',
}) => {
  const handleStart = () => {
    playSound('success');
    onStart();
  };
  const handleStop = () => {
    playSound('off');
    onStop();
  };
  const handleRestart = () => {
    playSound('on');
    onRestart();
  };

  const running = !!schedulerState;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
      <div className='flex items-center justify-between mb-1'>
        <div className="flex items-center space-x-2">
          <IconCalendarTime size={16} />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${running ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-400 dark:bg-green-400'}`}></div>
          <span className="text-[0.625rem] text-gray-600">
            <span className={` font-medium ${running ? 'text-green-600 dark:text-green-300' : 'text-gray-400 dark:text-gray-500'}`}>
              {running ? 'Running' : 'Stopped'}
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between space-x-5">
        <div className="flex-1 text-[0.625rem] text-gray-600 dark:text-gray-400 line-clamp-2">
          {summary}
        </div>

        <div className="w-[180px] flex items-center justify-end space-x-2">
          <ButtonGroup>
            <Button
              label="Start"
              onClick={handleStart}
              disabled={loading || running === true}
              className={`flex-1 ${running === true ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              size='xs'
            />
            <Button
              label="Stop"
              onClick={handleStop}
              disabled={loading || running === false}
              className={`flex-1 ${running === false ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}
              size='xs'
            />
            <Button
              label="Restart"
              onClick={handleRestart}
              disabled={loading || running === false}
              className={`flex-1 ${running === false ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
              size='xs'
            />
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
};

export default SchedulerControlPanel;
