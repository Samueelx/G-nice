import React, { useState } from 'react';
import BackButton from '../common/BackButton';
import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/solid';
import InputField from '../common/InputField';

interface AccountDetailsSectionProps {
  formData: {
    username: string;
    phoneNumber: string;
    password: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSignup: () => void;
  prevStep: () => void;
}

const AccountDetailsSection: React.FC<AccountDetailsSectionProps> = ({
  formData,
  handleInputChange,
  handleSignup,
  prevStep,
}) => {
  const [errors, setErrors] = useState({
    username: '',
    phoneNumber: '',
    password: '',
  });

  const validate = (): boolean => {
    let valid: boolean = true;
    const newErrors = {username: '', phoneNumber: '', password: ''};
    /**Username validation */
    if(formData.username.length < 3){
        newErrors.username = "Username must contain at least 3 characters."
        valid = false;
    }
    /**Phone number validation */
    if(!/^\d+$/.test(formData.phoneNumber)){
        newErrors.phoneNumber = 'Phone number must contain only numbers.';
        valid = false;
    }

    /**Password validation */
    if(formData.password.length < 8){
        newErrors.password = "Password must be at least 8 characters long.";
        valid = false;
    }
    setErrors(newErrors);
    return valid
  };

  const handleFormSubmit = () => {
    if (validate()) {
      handleSignup();
    }
  };

  return (
    <div className="w-full md:max-w-full p-8 bg-white rounded-lg shadow-md md:w-2/5 md:mx-auto md:my-16 h-screen md:h-full flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-8">Create Account</h2>
      <form className="space-y-12">
        <div>
         <InputField onChange={handleInputChange} name="username" type='text' value={formData.username} label='Username' errors=''/>
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>
        <div>
          <InputField onChange={handleInputChange} name='phoneNumber' type='tel' value={formData.phoneNumber} errors='' label='Phone Number'/>
          {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
        </div>
        <div>
          <InputField label='Password' type='password' name='password' value={formData.password} onChange={handleInputChange} errors=''/>
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <div className="flex justify-between mt-4">
          {/* <button
            type="button"
            onClick={prevStep}
            className="py-3 px-6 bg-gray-500 text-white rounded-full hover:bg-gray-700"
          >
            Back
          </button> */}
          <BackButton onClick={prevStep}/>
          <button
            type="button"
            onClick={handleFormSubmit}
            className=" flex items-center py-3 px-6 bg-[#6A00F4] text-white rounded-full hover:bg-[#4e00b3]"
          >
            Sign Up
            <ArrowRightEndOnRectangleIcon className='size-6 inline ml-2'/>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountDetailsSection;
