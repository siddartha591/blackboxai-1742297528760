import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Demo credentials check
    const validCredentials = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'officer', password: 'officer123', role: 'traffic_officer' }
    ];

    const user = validCredentials.find(
      cred => cred.username === credentials.username && cred.password === credentials.password
    );

    if (user) {
      // Store authentication state
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('username', user.username);
      
      // Redirect to the page user tried to visit or dashboard
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo);
    } else {
      setError('Invalid credentials. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <FontAwesomeIcon 
            icon="traffic-light" 
            className="mx-auto h-12 w-12 text-primary-600"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Traffic Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the control center
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon="spinner" spin className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Demo Credentials
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-600">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold">Admin Access:</p>
                <p>Username: <code className="font-mono bg-gray-100 px-1">admin</code></p>
                <p>Password: <code className="font-mono bg-gray-100 px-1">admin123</code></p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold">Traffic Officer Access:</p>
                <p>Username: <code className="font-mono bg-gray-100 px-1">officer</code></p>
                <p>Password: <code className="font-mono bg-gray-100 px-1">officer123</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;