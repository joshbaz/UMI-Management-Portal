import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { queryClient } from "../../utils/tanstack";
import { registerSuperAdminService } from "@/store/tanstackStore/services/api";
import { toast } from "sonner";
import logo1 from "../../assets/logo1.png";
import { Button } from "@/components/ui/button";
import { EyeOff, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import FormErrorHandler from "@/components/FormErrorHandler/FormErrorHandler";
import { Eye } from "lucide-react";

const RegisterSuperAdmin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const mutation = useMutation({
    mutationFn: registerSuperAdminService,
    onSuccess: () => {
      queryClient.invalidateQueries("users");
      toast.success("Super Admin Registered Successfully", {
        description: format(new Date(), "MMM d, yyyy h:mm a"),
        duration: Infinity,
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });
      navigate("/login", { replace: true });
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
    },
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      name: "",
      phone: "",
      email: "",
      designation: "",
      title: "",
      confirmPassword: "",
    },
    validationSchema: yup.object({
      title: yup
        .string()
        .min(1, "Must be 1 character or less")
        .required("Required"),
      email: yup
        .string()
        .min(5, "Must be more than 5 characters")
        .required("Required"),
      password: yup
        .string()
        .min(6, "Must be at least 6 characters")
        .required("Required"),
      name: yup
        .string()
        .min(5, "Must be 5 characters or less")
        .required("Required"),
      designation: yup
        .string()
        .min(2, "Must be at least 2 characters")
        .max(50, "Must be 50 characters or less")
        .required("Required"),
      phone: yup
        .string()
        .max(15, "Must be 15 characters or less")
        .required("Required"),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

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

    
      <div className="w-full max-w-xl px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-medium text-center mb-6">
            Register Super Admin
          </h1>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="flex gap-4 w-full">
              <div className="w-1/2">
                <label className="block text-sm mb-1" htmlFor="email">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border ${formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-200'} rounded text-sm`}
                  placeholder="Mr/Mrs/Ms/Dr/Prof"
                  value={formik.values.title}
                />
                <FormErrorHandler
                  errors={formik.touched.title && formik.errors.title}
                  message={formik.errors.title}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm mb-1" htmlFor="email">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-200'} rounded text-sm`}
                  placeholder="FirstName LastName"
                  value={formik.values.name}
                />
                <FormErrorHandler
                  errors={formik.touched.name && formik.errors.name}
                  message={formik.errors.name}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="example@gmail.com"
                  className={`w-full p-2 border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-200'} rounded text-sm`}
                  value={formik.values.email}
                />
                <FormErrorHandler
                  errors={formik.touched.email && formik.errors.email}
                  message={formik.errors.email}
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm mb-1" htmlFor="email">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="+2348060000000"
                  className={`w-full p-2 border ${formik.touched.phone && formik.errors.phone ? 'border-red-500' : 'border-gray-200'} rounded text-sm`}
                  value={formik.values.phone}
                />
                <FormErrorHandler
                  errors={formik.touched.phone && formik.errors.phone}
                  message={formik.errors.phone}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="email">
                Designation
              </label>
              <input
                id="designation"
                name="designation"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Manager/IT Admin"
                className={`w-full p-2 border ${formik.touched.designation && formik.errors.designation ? 'border-red-500' : 'border-gray-200'} rounded text-sm`}
                value={formik.values.designation}
              />
              <FormErrorHandler
                errors={formik.touched.designation && formik.errors.designation}
                message={formik.errors.designation}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="********"
                  className={`w-full p-2 border ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-200'} rounded text-sm`}
                  value={formik.values.password}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                      <Eye
                      width={20}
                      height={20}
                    />
                  ) : (
                    <EyeOff
                      width={20} 
                      height={20}
                    />
                  )}
                </button>
              </div>
              <FormErrorHandler
                errors={formik.touched.password && formik.errors.password}
                message={formik.errors.password}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="password">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="********"
                  className={`w-full p-2 border ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded text-sm`}
                  value={formik.values.confirmPassword}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                      <Eye
                        width={20}
                        height={20}
                      />
                  ) : (
                    <EyeOff
                      width={20}
                      height={20}
                    />
                  )}
                </button>
              </div>
              <FormErrorHandler
                errors={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                }
                message={formik.errors.confirmPassword}
              />
            </div>

            {mutation.isPending ? (
              <Button
                disabled
                className="w-full bg-blue-500 text-white p-2 rounded"
              >
                <Loader2 className="animate-spin" /> Registering...{" "}
              </Button>
            ) : (
              <Button
                disabled={mutation.isPending}
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded"
              >
                Register
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuperAdmin;
