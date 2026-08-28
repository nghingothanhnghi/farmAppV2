import type { ComponentType } from 'react';

import {
  IconDeviceMobileCheck,
  IconCamera,
  IconBrain,
  IconPlant,
  IconUserShield,
  IconSportBillard,
  IconCheese,
  IconArticle,
  IconCalendarCheck,
  IconAnalyze,
  IconCashRegister,
  IconCpu,
  IconActivity,
  IconBulb,
  IconDroplet,
  IconWind,
} from '@tabler/icons-react';

export interface MenuItem {
  id: string;
  label: string;
  to?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    id: 'scheduler-health',
    label: 'Scheduler Health',
    icon: IconCalendarCheck,
    to: '/scheduler-health',
  },

  {
    id: 'devices-controller',
    label: 'Devices Controller',
    icon: IconDeviceMobileCheck,
    children: [
      {
        id: 'all-devices',
        label: 'All Devices',
        icon: IconCpu,
        to: '/devices-controller',
      },

      {
        id: 'sensors',
        label: 'Sensors',
        icon: IconActivity,
        children: [
          {
            id: 'temperature',
            label: 'Temperature',
            to: '/devices-controller/sensors/temperature',
          },
          {
            id: 'humidity',
            label: 'Humidity',
            to: '/devices-controller/sensors/humidity',
          },
        ],
      },

      {
        id: 'actuators',
        label: 'Actuators',
        children: [
          {
            id: 'pump',
            label: 'Pump',
            icon: IconDroplet,
            to: '/devices-controller/actuators/pump',
          },
          {
            id: 'light',
            label: 'Light',
            icon: IconBulb,
            to: '/devices-controller/actuators/light',
          },
          {
            id: 'fan',
            label: 'Fan',
            icon: IconWind,
            to: '/devices-controller/actuators/fan',
          },
        ],
      },
    ],
  },

  {
    id: 'ar-detection',
    label: 'AR Object Detection',
    icon: IconCamera,
    to: '/ar-detection',
  },

  {
    id: 'model-training',
    label: 'Train YOLOv8 Model',
    icon: IconBrain,
    to: '/model-training',
  },

  {
    id: 'hydroponic-system',
    label: 'Hydroponic System',
    icon: IconPlant,
    children: [
      {
        id: 'hydro-dashboard',
        label: 'Dashboard',
        to: '/hydroponic-system',
      },
      {
        id: 'hydro-devices',
        label: 'Devices',
        to: '/hydro-devices',
      },
      {
        id: 'hydro-sensors',
        label: 'Sensors',
        children: [
          {
            id: 'hydro-temperature',
            label: 'Temperature',
            to: '/hydroponic-system/sensors/temperature',
          },
          {
            id: 'hydro-humidity',
            label: 'Humidity',
            to: '/hydroponic-system/sensors/humidity',
          },
        ],
      },
      {
        id: 'hydro-actuators',
        label: 'Actuators',
        children: [
          {
            id: 'hydro-pump',
            label: 'Pump',
            to: '/hydroponic-system/actuators/pump',
          },
          {
            id: 'hydro-light',
            label: 'Light',
            to: '/hydroponic-system/actuators/light',
          },
          {
            id: 'hydro-fan',
            label: 'Fan',
            to: '/hydroponic-system/actuators/fan',
          },
        ],
      },
    ],
  },

  {
    id: 'jackpot',
    label: 'Jackpot',
    icon: IconSportBillard,
    to: '/jackpot',
  },

  {
    id: 'products',
    label: 'Products',
    icon: IconCheese,
    to: '/dashboard/products',
  },

  {
    id: 'cms',
    label: 'CMS Content',
    icon: IconArticle,
    to: '/dashboard/cms',
  },

  {
    id: 'users',
    label: 'Users',
    icon: IconUserShield,
    to: '/users',
  },

  {
    id: 'migration',
    label: 'Data Migration',
    icon: IconAnalyze,
    to: '/migrate',
  },

  {
    id: 'payments',
    label: 'Payments',
    icon: IconCashRegister,
    to: '/payments',
  },
];