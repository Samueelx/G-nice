import React from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

interface NextButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const NextButton: React.FC<NextButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center px-6 py-3 bg-[#6A00F4] text-white rounded-full transition duration-300 ease-in-out hover:bg-[#5200d6] focus:outline-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      Next
      <ArrowRightIcon className="w-6 h-6 ml-2" />
    </button>
  );
};

export default NextButton;
