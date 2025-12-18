// FIX: Import React to provide the 'React' namespace for types like React.ReactNode.
import React from 'react';

export interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export interface LightSpectrumData {
    name: string;
    level: number;
}