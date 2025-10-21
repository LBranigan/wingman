import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (token) {
        try {
          // Store the token and get user info
          localStorage.setItem('token', token);

          // Fetch user data to check if bio is empty
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();

            // Check if user needs to complete their bio
            if (!userData.bio || userData.bio.trim() === '') {
              toast.success('Welcome! Please tell us about yourself 👋');
              navigate('/register?step=bio');
            } else {
              toast.success('Welcome back! 👋');
              navigate('/');
            }
            window.location.reload(); // Refresh to update auth state
          } else {
            toast.error('Failed to fetch user data');
            navigate('/');
            window.location.reload();
          }
        } catch (err) {
          toast.error('Failed to complete authentication');
          navigate('/login');
        }
      } else {
        toast.error('No authentication token received');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Completing sign in...</h1>
        <p className="text-gray-600">Please wait while we set up your account</p>
        <div className="mt-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
