import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import apiRequest from '../../utils/apiRequestUrl';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await apiRequest.post(`/management/request-password-reset`, {
        email
      });
      
      setSuccess(true);
      setEmail('');
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
          
          {success ? (
            <div>
              <Alert variant="success" className="mb-4 bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  Password reset link has been sent to your email. Please check your inbox.
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
            <form onSubmit={handleSubmit}>
              <p className="mb-4 text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="mb-4">
                <Input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Send Reset Link'}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                Remember your password? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestPasswordReset;