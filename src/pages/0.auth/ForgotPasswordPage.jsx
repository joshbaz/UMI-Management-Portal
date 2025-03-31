import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo1 from '../../assets/logo1.png';

/**
 * ForgotPasswordPage Component
 * Container for the forgot password form with appropriate layout
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add password reset logic
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8">
        <img src={logo1} alt="UMI Logo" className="h-[100px] w-[265px] mx-auto" />       
      </div>      

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-medium font-roboto text-center mb-6">Reset Password</h2>

            <p className="max-w-xs items-center font-normal text-sm text-center text-gray-600 mb-6">
              We'll send you a link to your email id if you're registered in the system.
            </p>  
          </div>
          

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium leading-5 mb-1.5">School Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@umi.ac.ug"
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-500 text-white py-2.5 rounded-md text-sm"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
