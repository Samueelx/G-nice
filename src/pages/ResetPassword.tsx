import { resetPassword } from "@/features/auth/authSlice";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [resetToken, setResetToken] = useState<string | null>(null);
    const { isLoading, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tokenFromUrl = searchParams.get('token');

        if (tokenFromUrl) {
            setResetToken(tokenFromUrl);
        } else {
            navigate('/login');
        }
    }, [location, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (passwordError) {
            setPasswordError(null);
        }
    }

    const validatePassword = () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }
        if (formData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // FIXED: Call the function with parentheses
        if (!validatePassword()) {
            return;
        }

        if (resetToken) {
            try {
                const resultAction = await dispatch(resetPassword({
                    token: resetToken,
                    newPassword: formData.newPassword
                }));
                
                // Check if the action was fulfilled
                if (resetPassword.fulfilled.match(resultAction)) {
                    navigate('/login', {
                        state: {
                            message: 'Password successfully reset. Please log in'
                        }
                    });
                }
            } catch (error) {
                console.log('Unexpected error occurred during password reset', error)
            }
        }
    };

    return (
        <section className="bg-[#E500A4] min-h-screen flex items-center justify-center">
            {/* Reset password container */}
            <div className="bg-cyan-100 flex rounded-2xl shadow-lg max-w-3xl p-5 min-h-screen md:min-h-full">
                {/* form */}
                <div className="sm:w-1/2 px-16">
                    <h2 className="font-bold text-2xl text-[#002D74]">Reset Password</h2>
                    <p className="text-sm mt-4 text-[#002D74]">
                        Enter your new password below
                    </p>

                    {error && (
                        <div className="mt-4 text-red-500 text-sm">{error}</div>
                    )}

                    {passwordError && (
                        <div className="mt-4 text-red-500 text-sm">{passwordError}</div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="relative mt-8">
                            <input
                                className="p-2 rounded-xl border w-full"
                                type={showPassword ? 'text' : 'password'}
                                name="newPassword"
                                placeholder="New Password"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                required
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="gray"
                                className="absolute top-1/2 right-3 -translate-y-1/2 bi bi-eye hover:cursor-pointer"
                                viewBox="0 0 16 16"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                            </svg>
                        </div>

                        <div className="relative">
                            <input
                                className="p-2 rounded-xl border w-full"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Confirm New Password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="gray"
                                className="absolute top-1/2 right-3 -translate-y-1/2 bi bi-eye hover:cursor-pointer"
                                viewBox="0 0 16 16"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                            </svg>
                        </div>

                        <button
                            type='submit'
                            className="bg-[#FEC5D8] rounded-xl py-2 hover:bg-[#feb5ce] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className="mt-10 text-xs flex justify-between items-center">
                        <p>Remembered your password?</p>
                        <button
                            className="py-2 px-5 bg-white border rounded-xl hover:bg-gray-50 transition-colors"
                            onClick={() => navigate('/login')}
                        >
                            Log In
                        </button>
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

export default ResetPassword;