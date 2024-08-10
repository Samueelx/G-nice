import React, { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import InputField from "../common/InputField";

interface PersonalInfoSectionProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nextStep: () => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  handleInputChange,
  nextStep,
}) => {
  const [errors, setError] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
  });
  const validate = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
    };
    /**Name validation */
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
    }
    /**Email Validation */
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    /**Date of Birth Validation */
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = "Date of Birth is required";
    }

    setError(newErrors);

    /**If no errors, proceed to next step */
    if (
      !newErrors.firstName &&
      !newErrors.lastName &&
      !newErrors.email &&
      !newErrors.dateOfBirth
    ) {
      nextStep();
    }
  };

  return (
    <div className="w-full md:max-w-full p-8 bg-white rounded-lg shadow-md md:w-2/5 md:mx-auto md:my-16 h-screen md:h-full flex flex-col justify-center">
      <div className="mb-8 text-center mx-auto">
        <h2 className="text-3xl font-bold">Let's Get Started</h2>
        <p className="text-gray-500">Connect with your friends today</p>
      </div>
      <form className="w-full flex flex-col gap-4 md:justify-center">
        <div className="my-4">
          <InputField onChange={handleInputChange} name="firstName" label="First Name" type="text" value={formData.firstName} errors={errors.firstName}/>
          {errors.firstName && (
            <p className="text-red-500 text-sm">{errors.firstName}</p>
          )}
        </div>
        <div className="my-4">
          <InputField onChange={handleInputChange} name="lastName" label="Last Name" value={formData.lastName} type="text" errors={errors.lastName}/>
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName}</p>
          )}
        </div>
        <div className="my-4">
          <InputField onChange={handleInputChange} name="email" label="Email" value={formData.email} type="text" errors={errors.email}/>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>
        <div className="my-4">
          <label className="block text-gray-400">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className={`block w-full max-w-xs px-0.5 border-0 border-b-2 bg-transparent text-gray-950 focus:outline-none focus:ring-0 peer ${
              errors.dateOfBirth ? "border-red-500" : ""
            }`}
          />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>
          )}
        </div>
        <button
          type="button"
          onClick={validate}
          className={`w-full flex items-center justify-center py-4 px-4 bg-[#6A00F4] text-white hover:bg-blue-700 rounded-full`}
        >
          Next
          <ArrowRightIcon className="w-6 h-6 ml-2"/>
        </button>
        {/* <NextButton onClick={validate}/> */}
      </form>
    </div>
  );
};

export default PersonalInfoSection;
