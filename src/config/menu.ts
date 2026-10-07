// src/config/menu.ts
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
  IconCarrot,
  IconCircleNumber1
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
    label: 'menu.portal.hydro_system.hydro_system_label',
    icon: IconPlant,
    children: [
      {
        id: 'hydro-dashboard',
        label: 'menu.portal.hydro_system.dashboard',
        icon: IconLayoutDashboard,
        to: '/hydroponic-system',
      },
      {
        id: 'hydro-devices',
        label: 'menu.portal.hydro_system.devices',
        icon: IconArtboard,
        to: '/hydro-devices',
      },
      {
        id: 'hydro-actuators',
        label: 'menu.portal.hydro_system.actuators',
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
        label: 'menu.portal.hydro_system.sensors',
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
      {
        id: 'hydro-batches',
        label: 'menu.portal.hydro_system.batches',
        icon: IconCarrot,
        to: '/dashboard/batches',
      },      
    ],
  },

  {
    id: 'jackpot',
    label: 'Jackpot',
    icon: IconCircleNumber1,
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
  { id: 'billiard', 
    label: 'Billiard', 
    icon: IconSportBillard, 
    to: '/billiard' 
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