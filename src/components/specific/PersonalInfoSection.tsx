import React from 'react';

interface PersonalInfoSectionProps {
  formData: {
    name: string;
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
  return (
    <div className="w-full md:max-w-full p-8 bg-white rounded-lg shadow-md md:w-2/5 md:mx-auto md:my-16 h-screen md:h-full flex flex-col justify-center">
      <div className='mb-6 text-center mx-auto'>
      <h2 className="text-3xl font-bold">Let's Get Started</h2>
      <p className='text-gray-500'>Connect with your friends today</p>
      </div>
      <form className='w-full mx-auto'>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="input input-bordered w-full max-w-xs bg-white text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input input-bordered w-full max-w-xs bg-white text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="input input-bordered w-full max-w-xs bg-white text-black"
          />
        </div>
        <button
          type="button"
          onClick={nextStep}
          className="w-full py-4 px-4 bg-[#6A00F4] text-white hover:bg-blue-700 rounded-full"
        >
          Next
        </button>
      </form>
    </div>
  );
};

export default PersonalInfoSection;
<input type="text" placeholder="Type here" className="" />