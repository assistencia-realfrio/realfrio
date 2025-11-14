"use client";

import React from 'react';
import { AuthProvider } from '@/hooks/useAuth';

const SessionContextProvider = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default SessionContextProvider;