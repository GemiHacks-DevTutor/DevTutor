'use client';

import { UserProvider } from '@/contexts/UserContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}
