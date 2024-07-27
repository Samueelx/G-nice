import React from "react";
import { useNavigate } from "react-router-dom";
import './login-button.css'

const LoginButton: React.FC = () => {
    const navigate = useNavigate();
    return (
        <button className="min-w-72 p-4 rounded-lg block font-semibold text-lg text-cyan-100 bg-gradient-to-r from-[#29323c] to-[#4e4376] shadow-lg gradient-bg" onClick={() => navigate('/login')}>Login</button>
    );
}

export default LoginButton;