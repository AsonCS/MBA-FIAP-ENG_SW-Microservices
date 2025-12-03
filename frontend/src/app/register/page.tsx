"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';
import { register } from '../../services/api';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await register(username, password);
      router.push('/login'); // Redirect to login on successful registration
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthForm type="register" onSubmit={handleSubmit} isLoading={isLoading} error={error} />
    </div>
  );
}