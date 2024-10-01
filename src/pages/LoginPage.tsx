import React, { useState } from "react";
import InputField from "../components/common/InputField";
import { Button } from "@/components/ui/button";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    console.log(`${name}: ${value}`);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("User Logged in with: ", formData);
  }
  return (
    <div className="md:min-h-screen flex items-center justify-center bg-[#E500A4]">
      <div className="md:w-full md:max-w-xs p-8 bg-white rounded-lg shadow-md w-screen h-screen md:h-full">
        <form className="space-y-6 md:h-fit flex flex-col gap-4 justify-center" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
          {/* Username/Email Input */}
          <div className="relative">
            <InputField
              type="text"
              errors=""
              label="Username or Email"
              onChange={handleInputChange}
              name="username"
              value={formData.username}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <InputField onChange={handleInputChange} type="password" name="password" label="Password" errors="" value={formData.password}/>
          </div>

          {/* Login Button */}
          <Button>Login</Button>
        </form>

        {/* Or */}
        <div className="text-center my-4 text-gray-500">or</div>

        {/* Google Login Button */}
        <Button variant="destructive">Login with Google</Button>
      </div>
    </div>
  );
};

export default LoginPage;
