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
  IconCircleNumber1,
  IconTag,
  IconCategory2,
  IconPhotoVideo,
  IconListTree
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
      },      
      {
        id: 'hydro-sensors',
        label: 'menu.portal.hydro_system.sensors',
        icon: IconActivity,
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
    label: 'CMS Management',
    icon: IconArticle,
    children: [
      {
        id: 'cms-posts',
        label: 'menu.portal.cms.posts',
        icon: IconArticle,
        to: '/dashboard/cms',
      },
      {
        id: 'cms-categories',
        label: 'menu.portal.cms.categories',
        icon: IconCategory2,
        to: '/dashboard/cms/categories',
      },   
      {
        id: 'cms-tags',
        label: 'menu.portal.cms.tags',
        icon: IconTag,
        to: '/dashboard/cms/tags',
      },  
      {
        id: 'cms-media',
        label: 'menu.portal.cms.media',
        icon: IconPhotoVideo,
        to: '/dashboard/cms/media',
      },
      {
        id: 'cms-menus',
        label: 'menu.portal.cms.menus',
        icon: IconListTree,
        to: '/dashboard/cms/menus',
      },                
    ],    
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