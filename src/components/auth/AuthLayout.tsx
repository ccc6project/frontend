import React from 'react';
interface AuthLayoutProps {  children: React.ReactNode;}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-500">
      <div className="px-5 py-6 rounded-3xl shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
