"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';
import { login } from '../../services/api';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(username, password);
      router.push('/'); // Redirect to home on successful login
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthForm type="login" onSubmit={handleSubmit} isLoading={isLoading} error={error} />
    </div>
  );
}