import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/UserAvatar';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: {
    href: string;
    label: string;
  };
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  backButton, 
  children 
}) => {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {backButton && (
              <>
                <Link href={backButton.href}>
                  <Button variant="ghost" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {backButton.label}
                  </Button>
                </Link>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              </>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">
                {title}
              </h1>
              {subtitle && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </span>
                </>
              )}
              {children}
            </div>
          </div>
          <UserAvatar />
        </div>
      </div>
    </div>
  );
};
