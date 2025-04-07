import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import apiRequest from '../../utils/apiRequestUrl';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Extract token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const resetToken = queryParams.get('token');
    
    if (!resetToken) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    } else {
      setToken(resetToken);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest.post(`/management/reset-password`, {
        token,
        newPassword: password
      });
      
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Reset Your Password
          </h1>
          
          {!token && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error || 'Invalid reset link'}</AlertDescription>
            </Alert>
          )}
          
          {success ? (
            <div>
              <Alert variant="success" className="mb-4 bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  Your password has been successfully reset.
                </AlertDescription>
              </Alert>
              <Button 
                asChild
                className="w-full py-2"
              >
                <Link to="/login">Return to Login</Link>
              </Button>
            </div>
          ) : (
            token && (
              <form onSubmit={handleSubmit}>
                <p className="mb-4 text-gray-600">
                  Enter your new password below.
                </p>
                
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="mb-4">
                  <Input
                    type="password"
                    placeholder="New Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="mb-4">
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full py-2"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Reset Password'}
                </Button>
                
                <div className="mt-4 text-center text-sm">
                  Remember your password? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </div>
              </form>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;