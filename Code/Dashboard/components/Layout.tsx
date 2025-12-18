import React from 'react';

interface LayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ title, subtitle, children }) => {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      {title && (
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {subtitle && <p className="text-light-text-secondary dark:text-dark-text-secondary">{subtitle}</p>}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
};