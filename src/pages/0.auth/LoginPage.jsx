import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext';
import { ROUTES } from '../../config/routes';
import logo1 from '../../assets/logo1.png';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { loginSuperAdmin, loginResearchCentreAdmin } from '../../store/tanstackStore/services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Eye, EyeOff } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('superAdmin');

  const [showPassword, setShowPassword] = useState(false);

  const superAdminMutation = useMutation({
    mutationFn: loginSuperAdmin,
    onSuccess: (data) => {
      login({
        token: data.token
      });
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: Infinity,
        description: format(new Date(), "MMM d, yyyy h:mm a"),
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });
    }
  });

  const researchCentreAdminMutation = useMutation({
    mutationFn: loginResearchCentreAdmin, 
    onSuccess: (data) => {
      login({
        token: data.token
      });
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: Infinity,
        description: format(new Date(), "MMM d, yyyy h:mm a"),
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });
    }
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validationSchema: yup.object({
      email: yup
        .string()
        .email('Invalid email address')
        .required('Email is required'),
      password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
    }),
    onSubmit: async (values) => {
      if (activeTab === 'superAdmin') {
        await superAdminMutation.mutateAsync({
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe
        });
      } else {
        await researchCentreAdminMutation.mutateAsync({
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe
        });
      }
    }
  });

  const handleSubmit = (e) => {
    toast.dismiss();
  
    e.preventDefault();
    formik.handleSubmit();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center">
      {/* Logo */}
      <div className="w-[150px] h-[60px] mb-6">
        <img 
          src={logo1} 
          alt="UMI Logo" 
          className="w-full h-full object-contain"
        />
      </div>

      <div className="w-full max-w-[400px] px-4"> 
        {/* Tabs */}
        <div className="flex gap-4 mb-4"> 
          <button
            className={`flex-1 h-10 px-3 py-2 rounded-md font-medium text-sm ${
              activeTab === 'superAdmin' 
                ? 'bg-[#E5F1FB] border border-[#ECF6FB]' 
                : 'bg-white border border-[#ECF6FB]'
            }`}
            onClick={() => setActiveTab('superAdmin')}
          >
            Super Admin
          </button>
          <button
            className={`flex-1 h-10 px-3 py-2 rounded-md font-medium text-sm ${
              activeTab === 'admin' 
                ? 'bg-[#E5F1FB] border border-[#ECF6FB]' 
                : 'bg-white border border-[#ECF6FB]'
            }`}
            onClick={() => setActiveTab('admin')}
          >
            Admin
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"> 
          <h1 className="text-2xl font-medium text-center mb-6">Login</h1>

          {activeTab === 'superAdmin' && (
            <div className="bg-[#FFF8E7] rounded p-3 mb-6">
              <p className="text-sm font-medium text-center">Super Admins Only</p>
              <p className="text-sm text-center">Please log in if you are a Manager or IT Admin.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">School Email</label>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full p-2 border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-200'} rounded text-sm`}
                placeholder="Enter your email"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-200'} rounded text-sm`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center"> 
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                  className="mr-2 w-4 h-4 border border-gray-300"
                />
                <label htmlFor="rememberMe" className="text-sm">Remember me</label>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                className="text-primary-500 text-sm font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#27357E] text-white rounded-md py-2 text-sm font-medium hover:bg-[#1f2861] transition-colors mt-6 flex items-center justify-center gap-2"
              disabled={activeTab === 'superAdmin' ? superAdminMutation.isPending : researchCentreAdminMutation.isPending}
            >
              {activeTab === 'superAdmin' ? (
                superAdminMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  'Login'
                )
              ) : (
                researchCentreAdminMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  'Login'
                )
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
