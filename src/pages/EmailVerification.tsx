import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/password-setup');
  };

  return (
    <main className="bg-[#E500A4] min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-12 text-center">
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-[#002D74] pb-4 font-akronim">
            G-nyce
          </h2>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative">
            <CheckCircle 
              className="text-green-500 animate-pulse" 
              size={120} 
            />
            <div className="absolute inset-0 bg-green-500 rounded-full opacity-25 animate-ping"></div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-[#002D74] mb-4">
            Check Your Email
          </h3>
          <p className="text-gray-600">
            We've sent a verification link to your email. 
            Please check your inbox and click the link to continue.
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full px-6 py-3 text-[#002D74] font-semibold rounded-3xl bg-[#FEC5D8] 
            hover:bg-[#FDB9D0] transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300"
        >
          Continue to Password Setup
        </button>
      </div>
    </main>
  );
};

export default EmailVerification;