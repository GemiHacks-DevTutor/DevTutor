'use client';

import { UserProvider, useUser } from '@/contexts/UserContext';
import { CourseProvider } from '@/contexts/CourseContext';

interface ProvidersProps {
  children: React.ReactNode;
}

function CourseProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  return <CourseProvider user={user}>{children}</CourseProvider>;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <UserProvider>
      <CourseProviderWrapper>
        {children}
      </CourseProviderWrapper>
    </UserProvider>
  );
}
