import React, { useState } from 'react';

interface EmailValidationSectionProps {
  email: string;
  handleEmailValidation: (isValid: boolean) => void;
  prevStep: () => void;
}

const EmailValidationSection: React.FC<EmailValidationSectionProps> = ({
  email,
  handleEmailValidation,
  prevStep,
}) => {
  const [code, setCode] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const validateEmail = () => {
    // Replace with actual validation logic
    const isValid = code === '1234';
    handleEmailValidation(isValid);
  };

  return (
    <div className="w-full md:max-w-md p-8 bg-white rounded-lg shadow-md md:w-auto md:mx-auto md:my-16 h-screen md:h-auto flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-2">Email Validation</h2>
      <p className="mb-4 text-gray-500">Please enter the code sent to your email: {email}</p>
      <input
        type="text"
        value={code}
        onChange={handleInputChange}
        className="input input-bordered w-full max-w-xs mb-4 bg-white text-black"
      />
      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="py-3 px-6 bg-gray-500 text-white rounded-full hover:bg-gray-700"
        >
          Back
        </button>
        <button
          type="button"
          onClick={validateEmail}
          className="py-3 px-6 bg-[#6A00F4] text-white rounded-full"
        >
          Validate
        </button>
      </div>
    </div>
  );
};

export default EmailValidationSection;
