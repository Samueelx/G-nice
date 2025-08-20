import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/features/auth/userSlice";
import type { RootState } from "@/store/store";
import { useAppDispatch } from "@/hooks/hooks";
import { useAppSelector } from "@/hooks/hooks";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  /**Form state */
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
  });

  /**Get state from redux */
  const { loading } = useAppSelector((state: RootState) => state.user);

  /**Handle input changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    /**Basic validation */
    if (
      !formData.firstname ||
      !formData.lastname ||
      !formData.email ||
      !formData.username
    ) {
      // You might want to add proper form validation here
      return;
    }

    try {
      const response = await dispatch(registerUser(formData)).unwrap();
      console.log("User Registration: ", response);
      
      // Use the success property instead of status
      if (response.success) {
        navigate("/email-verification");
      } else {
        // Handle unsuccessful registration but valid response
        console.error("Registration unsuccessful:", response.message);
      }
    } catch (error) {
      console.error("Registration failed: ", error);
    }
  };

  const handleLoginNavigation = () => {
    navigate("/login");
  };

  return (
    <main className="bg-[#E500A4] min-h-screen flex items-center justify-center p-4 md:p-0">
      <div className="bg-cyan-100 rounded-2xl shadow-lg w-dvw md:max-w-4xl md:flex">
        {/* Image Section - Hidden on mobile, visible on md screens and up */}
        <div className="hidden md:block md:w-1/2 bg-[#FEC5D8] rounded-l-2xl sm:flex items-center justify-center p-8">
          <img 
            src="/api/placeholder/500/600" 
            alt="Signup Illustration" 
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-[#002D74] pb-4 font-akronim">
              G-nyce
            </h2>
            <p className="text-[#002D74] font-mono font-thin text-sm md:text-base">
              Connect with your friends today
            </p>
          </div>

          <form className="flex flex-col gap-4 md:gap-6">
            <div className="relative">
              <input
                type="text"
                className={`p-2 rounded-xl border w-full peer placeholder-transparent focus:outline-none dark:text-white`}
                name="firstname"
                id="firstname"
                placeholder=" "
                value={formData.firstname}
                onChange={handleChange}
              />
              <label
                htmlFor="firstname"
                className={`absolute left-3 -top-6 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:text-base 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-sm`}
              >
                First Name
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                className={`p-2 rounded-xl border w-full peer placeholder-transparent focus:outline-none dark:text-white`}
                name="lastname"
                id="lastname"
                placeholder=" "
                value={formData.lastname}
                onChange={handleChange}
              />
              <label
                htmlFor="lastname"
                className={`absolute left-3 -top-6 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:text-base 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-sm`}
              >
                Last Name
              </label>
            </div>
            <div className="relative">
              <input
                type="email"
                className={`p-2 rounded-xl border w-full peer placeholder-transparent focus:outline-none dark:text-white`}
                name="email"
                id="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
              />
              <label
                htmlFor="email"
                className={`absolute left-3 -top-6 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:text-base 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-sm`}
              >
                Email
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                className={`p-2 rounded-xl border w-full peer placeholder-transparent focus:outline-none dark:text-white`}
                name="username"
                id="username"
                placeholder=" "
                value={formData.username}
                onChange={handleChange}
              />
              <label
                htmlFor="username"
                className={`absolute left-3 -top-6 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:text-base 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-sm`}
              >
                Choose a username
              </label>
            </div>
            <button
              onClick={handleClick}
              disabled={loading}
              className={`
              relative flex items-center justify-between w-full
              px-6 py-3 text-[#002D74] font-semibold rounded-3xl bg-[#FEC5D8]
              focus:ring-4 focus:ring-purple-300 focus:outline-none
              transition duration-300 ease-in-out 
              ${loading ? "opacity-75 cursor-not-allowed" : ""}
              group
            `}
            >
              {loading ? (
                <div className="flex items-center justify-center w-full">
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
                  Signing Up...
                </div>
              ) : (
                <>
                  <span>Continue</span>
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

            {/* Login Navigation */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Already have an account?
              </p>
              <button
                onClick={handleLoginNavigation}
                className="text-[#002D74] font-semibold hover:underline"
              >
                Log In
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Signup;