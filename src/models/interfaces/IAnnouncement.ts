import type { AnnouncementType } from '../types/AnnouncementType';
import type { ReactNode } from 'react';


export type AnnouncementSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

export interface IAnnouncementProps {
  size?: AnnouncementSize;
  type?: AnnouncementType;
  title?: string;
  message: ReactNode; // ⬅️ Accepts HTML/JSX now
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}
