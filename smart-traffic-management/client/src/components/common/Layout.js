import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'chart-line'
    },
    {
      name: 'Traffic Map',
      path: '/map',
      icon: 'route'
    },
    {
      name: 'Control Panel',
      path: '/control',
      icon: 'traffic',
      roles: ['admin', 'traffic_authority']
    },
    {
      name: 'Emergency Routes',
      path: '/emergency',
      icon: 'exclamation-triangle',
      roles: ['admin', 'traffic_authority']
    },
    {
      name: 'Signal Control',
      path: '/signals',
      icon: 'signal',
      roles: ['admin', 'traffic_authority']
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: 'chart-line',
      roles: ['admin', 'traffic_authority']
    }
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 bg-primary-600 text-white">
          <Link to="/" className="flex items-center space-x-2">
            <FontAwesomeIcon icon="traffic" className="text-2xl" />
            <span className="text-lg font-semibold">Traffic Management</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden"
          >
            <FontAwesomeIcon icon="times" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          {navigation.map((item) => {
            // Check if the user has permission to see this item
            if (item.roles && !item.roles.includes(user.role)) {
              return null;
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 mt-2 text-gray-600 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200 ${
                  location.pathname === item.path ? 'bg-primary-50 text-primary-600' : ''
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                <span className="mx-4">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className={`${isSidebarOpen ? 'lg:ml-64' : ''} transition-margin duration-300 ease-in-out`}>
        {/* Top bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              <FontAwesomeIcon icon={isSidebarOpen ? 'times' : 'bars'} className="w-6 h-6" />
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 focus:outline-none"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;