import React, { useState } from 'react';
import PersonalInfoSection from '../components/specific/PersonalInfoSection';
import EmailValidationSection from '../components/specific/EmailValidationSection';

const Signup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
  });

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEmailValidation = (isValid: boolean) => {
    if (isValid) {
      nextStep();
    } else {
      // handle invalid email
    }
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
          email={formData.email}
          handleEmailValidation={handleEmailValidation}
          prevStep={prevStep}
        />
      )}
      {/* Add more steps as needed */}
    </div>
  );
};

export default Signup;
