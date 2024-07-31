import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import useAuthorizeUser from './authorizeUser';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const userAuthenticated = useAuthorizeUser();

  useEffect(() => {
    if (userAuthenticated !== null && userAuthenticated !== undefined) {
      setIsLoading(false);
    }
  }, [userAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return userAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

export default PrivateRoute;
