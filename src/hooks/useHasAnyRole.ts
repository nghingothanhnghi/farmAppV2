// src/hooks/useHasAnyRole.ts
// Custom hook to check if the current user has any of the specified roles
import { useAuth } from '../contexts/authContext';

const useHasAnyRole = (roleNames: string[]): boolean => {
  const { roles } = useAuth();

  console.log('Current roles:', roles);

  if (!roles || !Array.isArray(roles)) return false;

  const normalizedInput = roleNames.map(r => r.toLowerCase());

  return roles.some(role => 
    role?.name && normalizedInput.includes(role.name.toLowerCase())
  );
};

export default useHasAnyRole;
