import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

const PrivateRoute = ({ element, allowedRoles }) => {
  const { role } = useUser();
  return allowedRoles.includes(role) ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
