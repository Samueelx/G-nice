import React, { useState } from "react";

const Signup: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setLoading(true);
  };

  return (
    <main className="bg-[#E500A4] min-h-screen flex items-center justify-center flex-col">
      {/* signup container */}
      <div className="bg-cyan-100 rounded-2xl shadow-lg p-5 md:max-w-5xl min-w-full min-h-screen md:min-w-max md:min-h-fit">
        <div className="p-6">
          <h2 className="text-6xl font-bold text-[#002D74] text-center pb-4 font-akronim">
            G-nyce
          </h2>
          <p className="text-[#002D74] text-center font-mono font-thin">
            Connect with your friends today
          </p>
        </div>
        <div>
          <form className="flex flex-col gap-8">
            <div className="relative">
              <input
                type="text"
                className={`p-2 rounded-xl border w-full peer placeholder-transparent focus:outline-none`}
                name="firstname"
                id="firstname"
                placeholder=" "
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
                className={`p-2 rounded-xl border w-full peer placeholder-transparent focus:outline-none`}
                name="lastname"
                id="lastname"
                placeholder=" "
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
                type="text"
                className={`p-2 rounded-xl border w-full peer placeholder-transparent focus:outline-none`}
                name="email"
                id="email"
                placeholder=" "
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
                className={`p-2 rounded-xl border w-full peer placeholder-transparent focus:outline-none`}
                name="username"
                id="username"
                placeholder=" "
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
              className={`relative flex items-center justify-center px-6 py-3 text-[#002D74] font-semibold rounded-3xl bg-[#FEC5D8]
              focus:ring-4 focus:ring-purple-300 focus:outline-none 
              transition duration-300 ease-in-out ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
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
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Signup;
