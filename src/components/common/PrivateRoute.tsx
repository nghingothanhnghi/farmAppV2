// src/components/common/PrivateRoute.tsx
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/authContext';
import { IconShieldCancel } from '@tabler/icons-react';
import LinearProgress from './LinearProgress';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, setShowLoginModal, roles } = useAuth();

  console.log("My role:", roles);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowLoginModal(true); // open login modal if not authenticated
    }
  }, [loading, isAuthenticated, setShowLoginModal]);
  if (loading) {
    return (
      <LinearProgress
        position="absolute"
        thickness="h-1"
        duration={3000}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="text-center mt-20 text-gray-500">
          <IconShieldCancel stroke={1.5} size={64} className='mx-auto mb-3' />
          You must log in to access this page.
        </div>
      </>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
