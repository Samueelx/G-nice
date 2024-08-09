import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

interface NextButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const BackButton: React.FC<NextButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center px-6 py-3 bg-gray-500 text-white rounded-full transition duration-300 ease-in-out hover:bg-gray-500 focus:outline-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <ArrowLeftIcon className="w-6 h-6 mr-2" />
      Back
    </button>
  );
};

export default BackButton;
