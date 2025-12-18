
import React from 'react';
import { DashboardCardProps } from '../types';

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, subtitle, children, className }) => {
  return (
    <div className={`bg-light-card dark:bg-dark-card rounded-xl shadow-lg p-6 flex flex-col ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-light-text dark:text-white">{title}</h2>
        {subtitle && <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{subtitle}</span>}
      </div>
      <div className="flex-grow flex flex-col">
        {children}
      </div>
    </div>
  );
};
