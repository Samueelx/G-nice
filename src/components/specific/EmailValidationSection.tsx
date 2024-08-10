import React, { useState } from 'react';
import NextButton from '../common/NextButton';
import BackButton from '../common/BackButton';

interface EmailValidationSectionProps {
  handleEmailValidation: (isValid: boolean) => void;
  prevStep: () => void;
}

const EmailValidationSection: React.FC<EmailValidationSectionProps> = ({
  handleEmailValidation,
  prevStep,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    /**Only allow integer input */
    if(/^\d*$/.test(value)){
      setCode(value);
      setError(null);
    } else {
      setError("Please enter valid code.")
    }
  };

  const validateEmail = () => {
    /**Check if code is not empty and contains only integers */
    if(code.trim() === ''){
      setError("The validation code cannot be empty");
      return;
    }

    /**Replace with actual validation logic. This is just a placeholder */
    const isValid = code === '1234';
    if(isValid){
      handleEmailValidation(true);
    } else {
      setError("The validation code is incorrect. Please try again.")
    }
  };

  return (
    <div className="w-full md:max-w-md p-8 bg-white rounded-lg shadow-md md:w-auto md:mx-auto md:my-16 h-screen md:h-auto flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-2">Email Validation</h2>
      <p className="mb-4 text-gray-500">Please enter the code sent to your email</p>
      <input
        type="text"
        value={code}
        onChange={handleInputChange}
        className="block w-full max-w-xs px-0.5 border-0 border-b-2 border-gray-300 bg-transparent text-gray-950 my-4 focus:outline-none focus:ring-0 focus:border-gray-950 peer"
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex justify-between">
        {/* <button
          type="button"
          onClick={prevStep}
          className="py-3 px-6 bg-gray-500 text-white rounded-full hover:bg-gray-700"
        >
          Back
        </button> */}
        <BackButton onClick={prevStep}/>
        {/* <button
          type="button"
          onClick={validateEmail}
          className="py-3 px-6 bg-[#6A00F4] text-white rounded-full"
        >
          Validate
        </button> */}
        <NextButton onClick={validateEmail}/>

      </div>
    </div>
  );
};

export default EmailValidationSection;
