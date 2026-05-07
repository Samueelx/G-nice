import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { verifyOtp } from '@/features/auth/authSlice';
import { UnknownAction } from '@reduxjs/toolkit';

const OtpVerification: React.FC = () => {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const email = location.state?.email || '';
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !email) {
      alert("Please enter OTP or ensure you have a valid email session.");
      return;
    }

    try {
      const resultAction = await dispatch(verifyOtp({ email, otp }) as unknown as UnknownAction);
      if (verifyOtp.fulfilled.match(resultAction)) {
        navigate('/feeds');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        alert("OTP sent again!");
      } else {
        alert("Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
    }
  };

  return (
    <main className="bg-[#E500A4] min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-12 text-center">
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-[#002D74] pb-4 font-akronim">
            G-nyce
          </h2>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-[#002D74] mb-4">
            Verify Your Email
          </h3>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to <br />
            <strong>{email || 'your email'}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              className="p-3 rounded-xl border w-full text-center tracking-widest text-2xl focus:outline-none focus:ring-2 focus:ring-[#FEC5D8]"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className={`
              w-full px-6 py-3 text-[#002D74] font-semibold rounded-3xl bg-[#FEC5D8] 
              hover:bg-[#FDB9D0] transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300
              ${(isLoading || otp.length < 6) ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Didn't receive the code?{' '}
          <button 
            type="button"
            onClick={handleResend}
            className="text-[#002D74] font-semibold hover:underline"
          >
            Resend
          </button>
        </div>
      </div>
    </main>
  );
};

export default OtpVerification;
