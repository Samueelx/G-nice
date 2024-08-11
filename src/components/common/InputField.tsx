import React, { useState } from 'react';

type InputFieldProps =  {
  label: string;
  type: string;
  value: string;
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, type, value, onChange, name, errors }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        name={name}
        id={name}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(value !== '')}  // Keeps label up if there's text
        placeholder={isFocused ? '' : label}
        className={`block w-full max-w-xs px-0.5 border-0 border-b-2 bg-transparent text-gray-950 ${
          isFocused ? 'border-gray-950' : 'border-gray-300'
        } text-gray-900 focus:outline-none focus:ring-0 peer ${errors ? 'border-red-500' : ''}`}
      />
      <label htmlFor={name}
        className={`absolute left-0 -top-1 text-base text-gray-500 transition-transform transform ${
          isFocused || value ? '-translate-y-5 scale-75 text-gray-400 opacity-100' : 'opacity-0 translate-y-0 scale-100'
        } peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-5 peer-focus:scale-75`}
      >
        {label}
      </label>
    </div>
  );
};

export default InputField;
