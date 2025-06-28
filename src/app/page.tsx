'use client';

import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Home = () => {
  const { user, isLoggingIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    } else if (!isLoggingIn) {
      router.push('/login');
    }
  }, [user, isLoggingIn, router]);

  if (isLoggingIn) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      Welcome to DevTutor!
    </div>
  );
};

export default Home;
