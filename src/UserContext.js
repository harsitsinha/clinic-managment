import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      setRole('admin');
    } else if (username === 'user' && password === 'user123') {
      setRole('user');
    } else {
      alert('Invalid credentials');
    }
  };

  const logout = () => {
    setRole(null);
  };

  return (
    <UserContext.Provider value={{ role, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
