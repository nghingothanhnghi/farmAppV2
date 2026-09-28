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
  IconActivity,
  IconLayoutDashboard,
  IconArtboard,
  IconGitCherryPick,
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
    to: '/devices-controller',
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
        icon: IconLayoutDashboard,
        to: '/hydroponic-system',
      },
      {
        id: 'hydro-devices',
        label: 'Devices',
        icon: IconArtboard,
        to: '/hydro-devices',
      },
      {
        id: 'hydro-actuators',
        label: 'Actuators',
        icon: IconGitCherryPick,
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
      {
        id: 'hydro-sensors',
        label: 'Sensors',
        icon: IconActivity,
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