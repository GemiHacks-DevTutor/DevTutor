'use client';

import { UserProvider, useUser } from '@/contexts/UserContext';
import { CourseProvider } from '@/contexts/CourseContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

const AuthGuard: React.FC<Props> = ({ children }) => {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/login' || pathname === '/signup') 
      return;

    if(!user)
      router.push('/login');

    if (user && !user.hasCompletedSurvey && pathname !== '/questionnaire')
      router.push('/questionnaire');
    
  }, [user, router, pathname]);

  return (
    <>
      {children}
    </>
  );
};

const CourseProviderWrapper: React.FC<Props> = ({ children }) => {
  const { user } = useUser();

  return <CourseProvider user={user}>{children}</CourseProvider>;
};

const Providers: React.FC<Props> = ({ children }) => {

  return (
    <UserProvider>
      <AuthGuard>
        <CourseProviderWrapper>
          {children}
        </CourseProviderWrapper>
      </AuthGuard>
    </UserProvider>
  );
};

export default Providers;
