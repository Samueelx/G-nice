import { loginUser, googleSignIn, clearError } from '@/features/auth/authSlice';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

interface FormData {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Clear errors when component mounts or when user starts typing
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User authenticated, redirecting to feeds");
      navigate('/feeds', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear form errors when user starts typing
  useEffect(() => {
    if (formData.username || formData.password) {
      setFormErrors({});
    }
  }, [formData.username, formData.password]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const resultAction = await dispatch(loginUser(formData));
      
      if (loginUser.fulfilled.match(resultAction)) {
        console.log('Login successful');
        // Navigation will happen automatically via useEffect
      } else if (loginUser.rejected.match(resultAction)) {
        console.error('Login failed:', resultAction.payload);
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setFormErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setFormErrors({ general: 'Google authentication failed. Please try again.' });
      return;
    }

    console.log("Google credential received");
    setIsSubmitting(true);

    try {
      const resultAction = await dispatch(googleSignIn(credentialResponse.credential));
      
      if (googleSignIn.fulfilled.match(resultAction)) {
        console.log('Google sign-in successful');
        // Navigation will happen automatically via useEffect
      } else if (googleSignIn.rejected.match(resultAction)) {
        console.error('Google sign-in failed:', resultAction.payload);
        setFormErrors({ general: 'Google sign-in failed. Please try again.' });
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setFormErrors({ general: 'Google sign-in encountered an error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleFailure = () => {
    console.error('Google Sign-In was unsuccessful');
    setFormErrors({ general: 'Google sign-in was unsuccessful. Please try again.' });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  const handleRegister = () => {
    navigate('/signup');
  };

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <section className="bg-[#E500A4] min-h-screen flex items-center justify-center p-4">
      {/* Login container */}
      <div className="bg-cyan-100 flex rounded-2xl shadow-lg max-w-3xl w-full p-5 min-h-screen md:min-h-full">
        {/* Form */}
        <div className="sm:w-1/2 px-4 sm:px-16 flex flex-col justify-center">
          <header className="mb-8">
            <h1 className="font-bold text-2xl text-[#002D74]">Login</h1>
            <p className="text-sm mt-4 text-[#002D74]">
              If you're already a member, easily log in
            </p>
          </header>

          {/* Error Display */}
          {(error || formErrors.general) && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error || formErrors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                className={`p-3 rounded-xl border w-full transition-colors ${
                  formErrors.username 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 focus:border-[#002D74] focus:outline-none'
                }`}
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                autoComplete="username"
                aria-invalid={!!formErrors.username}
                aria-describedby={formErrors.username ? "username-error" : undefined}
              />
              {formErrors.username && (
                <p id="username-error" className="mt-1 text-red-600 text-sm">
                  {formErrors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className={`p-3 rounded-xl border w-full pr-12 transition-colors ${
                    formErrors.password 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 focus:border-[#002D74] focus:outline-none'
                  }`}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isFormDisabled}
                  autoComplete="current-password"
                  aria-invalid={!!formErrors.password}
                  aria-describedby={formErrors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#002D74]"
                  onClick={togglePasswordVisibility}
                  disabled={isFormDisabled}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="gray"
                    className="bi bi-eye"
                    viewBox="0 0 16 16"
                  >
                    {showPassword ? (
                      // Eye slash icon
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                    ) : (
                      // Eye icon
                      <>
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {formErrors.password && (
                <p id="password-error" className="mt-1 text-red-600 text-sm">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="bg-[#FEC5D8] rounded-xl py-3 hover:bg-[#feb5ce] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={isFormDisabled}
            >
              {isFormDisabled ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-10 grid grid-cols-3 items-center text-gray-500">
            <hr className="border-gray-500" />
            <p className="text-center text-sm">OR</p>
            <hr className="border-gray-500" />
          </div>

          {/* Google Login */}
          <div className="flex justify-center mt-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              type="standard"
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
              disabled={isFormDisabled}
            />
          </div>

          {/* Footer Links */}
          <div className="mt-10 text-xs border-b py-4">
            <button 
              type="button"
              className="text-[#002D74] hover:underline focus:outline-none focus:underline"
              onClick={handleForgotPassword}
              disabled={isFormDisabled}
            >
              Forgot your password?
            </button>
          </div>
          
          <div className="mt-3 text-xs flex justify-between items-center">
            <p className="text-gray-600">If you don't have an account...</p>
            <button 
              type="button"
              className="py-2 px-5 bg-white border rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleRegister}
              disabled={isFormDisabled}
            >
              Register
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="sm:block hidden w-1/2">
          <img 
            className="rounded-2xl w-full h-full object-cover" 
            src="gnice-login.jpg" 
            alt="Login illustration"
          />
        </div>
      </div>
    </section>
  );
};

export default LoginPage;