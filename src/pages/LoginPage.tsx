import { loginUser, googleSignIn } from '@/features/auth/authSlice';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { UnknownAction } from '@reduxjs/toolkit';


const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  // const [error, setError] = useState<string | null>(null);
  const {isLoading, error} = useAppSelector((state) => state.auth);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  /**Redirect authenticated users away from login page */
  useEffect(() => {
    if(isAuthenticated){
      console.log("Is Authenticated ?", isAuthenticated);
      navigate('/feeds');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    try{
      const resultAction = await dispatch(loginUser(formData) as unknown as UnknownAction);
      if(loginUser.fulfilled.match(resultAction)){
        navigate('/feeds');
      }
    } catch(err){
      console.log('Unexpected error during login:', err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: {credential?: string}) => {
    if(credentialResponse.credential){
      console.log("Credentials: ", credentialResponse.credential);
      try{
        const resultAction = await dispatch(googleSignIn(credentialResponse.credential) as unknown as  UnknownAction);
        console.log("result action: ", resultAction);
        if(googleSignIn.fulfilled.match(resultAction)){
          navigate('/feeds');
        }
      } catch(error) {
        console.error('Google Sign-In error:', error);
      }
    }
  };

  const handleGoogleFailure = () => {
    console.error('Google Sign-In was unsuccessful');
  };


  return (
    <section className="bg-[#E500A4] min-h-screen flex items-center justify-center p-0 md:p-4">
      {/* login container */}
      <div className="bg-cyan-100 w-full h-screen md:h-auto md:rounded-2xl md:shadow-lg md:max-w-3xl flex md:p-5">
        {/* form */}
        <div className="w-full sm:w-1/2 px-6 md:px-16 flex flex-col justify-center min-h-screen md:min-h-0">
          <div className="mb-8">
            <h2 className="font-bold text-2xl text-[#002D74]">Login</h2>
            <p className="text-sm mt-4 text-[#002D74]">
              If you're already a member, easily log in
            </p>
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8">
            <div className="relative mt-6">
              <input
                className="p-2 rounded-xl border w-full peer placeholder-transparent focus:outline-none"
                type="text"
                name="username"
                id="username"
                placeholder=" "
                value={formData.username}
                onChange={handleInputChange}
              />
              <label
                htmlFor="username"
                className="absolute left-3 -top-5 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:text-base 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm"
              >
                Username
              </label>
            </div>
            
            <div className="relative">
              <input
                className="p-2 rounded-xl border w-full peer placeholder-transparent focus:outline-none"
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder=" "
                value={formData.password}
                onChange={handleInputChange}
              />
              <label
                htmlFor="password"
                className="absolute left-3 -top-5 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:text-base 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm"
              >
                Password
              </label>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="gray"
                className="absolute top-1/2 right-3 -translate-y-1/2 bi bi-eye cursor-pointer"
                viewBox="0 0 16 16"
                onClick={() => setShowPassword(!showPassword)}
              >
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
              </svg>
            </div>
            
            <button 
              type='submit' 
              className="bg-[#FEC5D8] rounded-xl py-2 hover:bg-[#feb5ce] transition-colors disabled:opacity-75" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-10 grid grid-cols-3 items-center text-gray-500">
            <hr className="border-gray-500" />
            <p className="text-center text-sm">OR</p>
            <hr className="border-gray-500" />
          </div>

          <div className="flex justify-center mt-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              type="standard"
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          <div className="mt-10 text-xs border-b py-4">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              navigate('/forgot-password');
            }}>Forgot your password?</a>
          </div>
          <div className="mt-3 text-xs flex justify-between items-center">
            <p>If you don't have an account...</p>
            <button className="py-2 px-5 bg-white border rounded-xl" onClick={() => navigate('/signup')}>Register</button>
          </div>
        </div>
        {/* image */}
        <div className="sm:block hidden w-1/2">
          <img className="rounded-2xl" src="gnice-login.jpg" alt="" />
        </div>
      </div>
    </section>
  );
};

export default LoginPage;