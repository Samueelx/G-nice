import React, { useState } from 'react';
import PersonalInfoSection from '../components/specific/PersonalInfoSection';
import EmailValidationSection from '../components/specific/EmailValidationSection';
import AccountDetailsSection from '../components/specific/AccountDetailsSection';

const Signup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    username: '',
    phoneNumber: '',
    password: ''
  });

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    console.log(`Input changed. ${value}`);
  };

  const handleEmailValidation = (isValid: boolean) => {
    if (isValid) {
      nextStep();
    } else {
      // handle invalid email
    }
  };

  const createAccount = () => {
    // Logic to create account with formData
    console.log('Account created with:', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E500A4]">
      {currentStep === 1 && (
        <PersonalInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          nextStep={nextStep}
        />
      )}
      {currentStep === 2 && (
        <EmailValidationSection
          handleEmailValidation={handleEmailValidation}
          prevStep={prevStep}
        />
      )}
       {currentStep === 3 && (
        <AccountDetailsSection
          formData={formData}
          handleInputChange={handleInputChange}
          handleSignup={createAccount}
          prevStep={prevStep}
        />
      )}
      {/* Add more steps as needed */}
    </div>
  );
};

export default Signup;
