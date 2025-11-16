import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useGetCurrentUserQuery } from '../../store/api';
import { setCredentials } from '../../store/slices/authSlice';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const token = localStorage.getItem('token');
  
  const { data, isLoading, isError } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  // Sync auth state when getCurrentUser succeeds
  useEffect(() => {
    if (data?.success && data.data && token) {
      dispatch(setCredentials({
        user: data.data,
        token: token,
      }));
    }
  }, [data, token, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || isError || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

