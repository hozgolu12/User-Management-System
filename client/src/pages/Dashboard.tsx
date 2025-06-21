import React from 'react';
import { useAuth } from '@/contexts/useAuth';
import Header from '@/components/Header';
import UserManagement from '@/components/UserManagement';
import AdminApproval from '@/components/AdminApproval';
import UserProfile from '@/components/UserPofile';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
               {user?.role === 'admin' ?
                (user?.isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard') : 
                'User Dashboard'
              }
            </h1>
            <p className="text-gray-600">
              {user?.role === 'admin' 
                ? user?.isSuperAdmin
                  ? 'Full system management access'
                  : 'Manage users and approve admin requests'
                : 'Manage your profile and account settings'
              }
            </p>
          </div>
          
           {user?.role === 'admin' ? (
            <>
              <div className="mb-6">
                <AdminApproval />
              </div>
              <UserManagement />
            </>
          ) : (
            <UserProfile />
          )}
          
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
