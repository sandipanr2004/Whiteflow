import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthSwitch from '../components/ui/demo';

export const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full flex items-center justify-center pt-24 pb-12 px-4 bg-gray-50 dark:bg-[#121212]">
      <AuthSwitch onSuccess={() => navigate('/')} />
    </div>
  );
};
