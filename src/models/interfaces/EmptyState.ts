// File: frontend/src/models/interfaces/EmptyState.ts
// This file defines the interface for the EmptyState component
export interface EmptyStateProps {
  imageSrc?: string; // Static image alternative
  icon?: React.ReactNode; // Icon alternative (e.g., <IconInbox />)
  animationData?: object; // imported Lottie JSON
  message: string;
  height?: number;
  width?: number;
}