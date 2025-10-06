//Será el contenedor elegante que le da coherencia al Login y al Registro.

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-800">
      <div className="p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
