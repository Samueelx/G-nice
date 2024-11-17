import React, { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const PasswordSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(pass)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(pass)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setErrors({
      ...errors,
      password: validatePassword(newPassword),
    });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setErrors({
      ...errors,
      confirmPassword: 
        newConfirmPassword !== password ? "Passwords do not match" : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (errors.password || errors.confirmPassword) {
      return;
    }
    setLoading(true);
    // Add your password submission logic here
  };

  return (
    <main className="bg-[#E500A4] min-h-screen flex items-center justify-center flex-col">
      <div className="bg-cyan-100 rounded-2xl shadow-lg p-5 md:max-w-5xl min-w-full min-h-screen md:min-w-max md:min-h-fit sm:w-1/2 px-16">
        <div className="p-6 pb-8">
          <h2 className="text-6xl font-bold text-[#002D74] text-center pb-4 font-akronim">
            G-nyce
          </h2>
          <p className="text-[#002D74] text-center font-mono font-thin">
            Set up your account password
          </p>
        </div>
        
        <form className="flex flex-col gap-8 md:items-center" onSubmit={handleSubmit}>
          <div className="relative">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="p-2 rounded-xl border w-full md:w-56 peer placeholder-transparent focus:outline-none dark:text-white"
                name="password"
                id="password"
                placeholder=" "
                value={password}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
              <label
                htmlFor="password"
                className="absolute left-3 -top-6 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:text-base 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-sm"
              >
                Password
              </label>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="relative">
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="p-2 rounded-xl border w-full md:w-56 peer placeholder-transparent focus:outline-none dark:text-white"
                name="confirmPassword"
                id="confirmPassword"
                placeholder=" "
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
              <label
                htmlFor="confirmPassword"
                className="absolute left-3 -top-6 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:text-base 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-sm"
              >
                Confirm Password
              </label>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="text-sm text-gray-600 text-center max-w-xs">
            Password must contain:
            <ul className="list-disc list-inside mt-2 text-left">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>

          <button
            type="submit"
            // disabled={loading || errors!.password || errors!.confirmPassword}
            className={`
              relative flex items-center justify-between md:w-56
              px-6 py-3 text-[#002D74] font-semibold rounded-3xl bg-[#FEC5D8]
              focus:ring-4 focus:ring-purple-300 focus:outline-none
              transition duration-300 ease-in-out 
              ${loading || errors.password || errors.confirmPassword ? "opacity-75 cursor-not-allowed" : ""}
              group
            `}
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-white mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Setting up...
              </div>
            ) : (
              <>
                <span>Create Account</span>
                <svg
                  className="w-5 h-5 transform transition-transform duration-200 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
};

export default PasswordSetup;