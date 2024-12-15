import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { forgotPassword } from '@/features/auth/authSlice';
import { UnknownAction } from '@reduxjs/toolkit';

const ForgotPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const { isLoading, error, message } = useAppSelector((state) => state.auth);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(forgotPassword(email) as unknown as UnknownAction);
      
      if (forgotPassword.fulfilled.match(resultAction)) {
        // Optionally navigate to a confirmation page or show a success message
        navigate('/reset-password');
      }
    } catch (err) {
      console.log('Unexpected error during forgot password request:', err);
    }
  };

  return (
    <section className="bg-[#E500A4] min-h-screen flex items-center justify-center">
      {/* Container */}
      <div className="bg-cyan-100 flex rounded-2xl shadow-lg max-w-md w-full p-8">
        <div className="w-full">
          <h2 className="font-bold text-2xl text-[#002D74] mb-4">Forgot Password</h2>
          <p className="text-sm mb-6 text-[#002D74]">
            Enter the email address associated with your account
          </p>

          {error && (
            <div className="mb-4 text-red-500 text-sm">{error}</div>
          )}

          {message && (
            <div className="mb-4 text-green-600 text-sm">{message}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              className="p-2 rounded-xl border"
              type="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={handleInputChange}
              required
            />
            
            <button 
              type="submit" 
              className="bg-[#FEC5D8] rounded-xl py-2 hover:bg-[#feb5ce] transition-colors" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-xs flex justify-between items-center">
            <button 
              className="text-[#002D74] hover:underline"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;