// src/models/interfaces/PageTitle.ts
import type { ReactNode } from 'react';
export interface PageTitleProps {
  title: string;
  subtitle?: ReactNode; // optional subtitle for additional context
  actions?: ReactNode; // anything: button, dropdown, etc.
  align?: 'left' | 'center' | 'right';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  width?: string; // e.g. "400px" or "50%"
}
