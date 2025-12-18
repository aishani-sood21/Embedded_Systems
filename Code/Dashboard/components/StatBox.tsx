
import React from 'react';

interface StatBoxProps {
  label: string;
  value: string;
}

export const StatBox: React.FC<StatBoxProps> = ({ label, value }) => {
  return (
    <div className="flex-1 text-center bg-light-bg dark:bg-dark-bg/50 p-3 rounded-lg border border-light-border dark:border-dark-border">
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
      <p className="text-lg font-semibold text-light-text dark:text-white">{value}</p>
    </div>
  );
};
