// src/components/HydroponicSystemPage/components/SettingsPanel.tsx
import React, { useState, useEffect } from 'react';
import Form, { FormGroup, FormLabel, FormActions } from '../../common/Form'
import type { SystemThresholds as Thresholds } from '../../../models/interfaces/HydroSystem';
import Button from '../../common/Button';
import NumberInput from '../../common/NumberInput';
import { useAlert } from '../../../contexts/alertContext';
import { defaultThresholds } from '../../../constants/defaultThresholds';

interface SettingsPanelProps {
  thresholds: Thresholds | null;
  onUpdateThresholds: (thresholds: Partial<Thresholds>) => void;
  loading?: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  thresholds,
  onUpdateThresholds,
  loading = false
}) => {
  const { setAlert } = useAlert();
  const [localThresholds, setLocalThresholds] = useState<Thresholds>(defaultThresholds);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (thresholds) {
      setLocalThresholds(thresholds);
      setHasChanges(false);
    }
  }, [thresholds]);

  const handleThresholdChange = (key: keyof Thresholds, value: number) => {
    setLocalThresholds(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateThresholds(localThresholds); // Assume this is async (or wrap in a Promise if not)
      setAlert({ message: 'Thresholds updated successfully.', type: 'success' });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update thresholds:', error);
      setAlert({ message: 'Failed to update thresholds.', type: 'error' });
    }
  };


  const handleReset = () => {
    if (thresholds) {
      setLocalThresholds(thresholds);
      setHasChanges(false);
    }
  };

  return (
    <Form onSubmit={handleSave} className="space-y-10 mx-auto max-w-4xl">
      {/* Threshold Settings */}
      <h3 className="text-base font-medium text-gray-700 mt-10 mb-6">Alert Thresholds</h3>
      {/* Moisture Minimum */}
      <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
        <div className='space-y-1'>
          <FormLabel htmlFor="moisture_min">Minimum Moisture</FormLabel>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Alert when moisture drops below this level</p>
        </div>
        <div className="relative w-50">
          <NumberInput
            id="moisture_min"
            value={localThresholds.moisture_min}
            onChange={(value) => handleThresholdChange('moisture_min', value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            %
          </span>
        </div>
      </FormGroup>
      <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
      {/* Light Minimum */}
      <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
        <div className='space-y-1'>
          <FormLabel htmlFor="light_min">Minimum Light</FormLabel>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Alert when light drops below this level</p>
        </div>
        <div className="relative w-50">
          <NumberInput
            id="light_min"
            value={localThresholds.light_min}
            onChange={(value) => handleThresholdChange('light_min', value)}
            min={0}
            max={2000}
            step={10}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            lux
          </span>
        </div>
      </FormGroup>
      <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
      {/* Temperature Maximum */}
      <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
        <div className='space-y-1'>
          <FormLabel htmlFor="temperature_max">Maximum Temperature</FormLabel>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Alert when temperature exceeds this level</p>
        </div>
        <div className="relative w-50">
          <NumberInput
            id="temperature_max"
            value={localThresholds.temperature_max}
            onChange={(value) => handleThresholdChange('temperature_max', value)}
            min={0}
            max={50}
            step={0.5}
            className="w-full"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            °C
          </span>
        </div>
      </FormGroup>
      <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
      {/* Water Level Minimum */}
      <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
        <div className='space-y-1'>
          <FormLabel htmlFor="water_level_min">Minimum Water Level</FormLabel>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
            Alert when water level drops below this level
          </p>
        </div>
        <div className="relative w-50">
          <NumberInput
            id="water_level_min"
            value={localThresholds.water_level_min}
            onChange={(value) => handleThresholdChange('water_level_min', value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            cm
          </span>
        </div>
      </FormGroup>
      <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>

      {/* Water Level Critical */}
      <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
        <div className='space-y-1'>
          <FormLabel htmlFor="water_level_critical">Critical Water Level</FormLabel>
          <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
            Trigger immediate alert when water level is critically low
          </p>
        </div>
        <div className="relative w-50">
          <NumberInput
            id="water_level_critical"
            value={localThresholds.water_level_critical}
            onChange={(value) => handleThresholdChange('water_level_critical', value)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            cm
          </span>
        </div>
      </FormGroup>


      <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
      {/* System Information */}
      <div>
        <h3 className="text-base font-medium text-gray-700 mb-3">System Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className='text-xs'>
            <span className="text-gray-500">Last Updated:</span>
            <div className="font-medium">
              {new Date().toLocaleString()}
            </div>
          </div>
          <div className='text-xs'>
            <span className="text-gray-500">Auto-refresh:</span>
            <div className="font-medium text-green-600">
              Every 5 seconds
            </div>
          </div>
        </div>
      </div>
      <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
      <FormActions
        className='lg:static fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-2 gap-4'
      >
        <Button
          type="submit"
          label={loading ? 'Saving...' : 'Save Changes'}
          disabled={!hasChanges || loading}
          variant="primary"
          className='md:w-auto'
          fullWidth={true}
          rounded='lg'
        />
        <Button
          type="button"
          label="Reset"
          onClick={handleReset}
          disabled={!hasChanges || loading}
          variant="secondary"
          className='md:w-auto'
          fullWidth={true}
          rounded='lg'
        />
      </FormActions>
    </Form>
  );
};

export default SettingsPanel;