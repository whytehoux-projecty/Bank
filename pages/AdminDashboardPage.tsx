
import React, { useState } from 'react';
import { useAuth } from '../App';
import { MOCK_USERS } from '../constants'; // Using applications from AuthContext
import { User, AccountApplication, AuthRole } from '../types';

const AdminDashboardPage: React.FC = () => {
  const { currentUser, applications, updateApplicationStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'applications'>('applications');
  
  // For demo, admin can see all users. In real app, role-based access would be stricter.
  const users = MOCK_USERS; 

  if (!currentUser || currentUser.role !== AuthRole.Admin) {
    return <p className="text-center text-xl text-red-500 anim-fadeIn">Access Denied. Administrator privileges required.</p>;
  }
  
  const handleApplicationAction = (appId: string, newStatus: 'approved' | 'rejected') => {
    // Add a confirmation dialog for real-world applications
    updateApplicationStatus(appId, newStatus);
  };

  return (
    <div className="space-y-12 py-2 anim-fadeInUp"> {/* Reduced top py */}
      <h1 className="text-4xl font-bold text-[#A41E22] anim-fadeInUp" style={{animationDelay: '0.1s'}}>Admin Control Panel</h1> {/* Zenith Red */}
      <p className="text-gray-600 anim-fadeInUp" style={{animationDelay: '0.2s'}}>Welcome, Administrator <span className="font-semibold text-[#A41E22]">{currentUser.username}</span>.</p> {/* Zenith Red */}

      {/* Tabs */}
      <div className="border-b border-gray-300 anim-fadeInUp" style={{animationDelay: '0.3s'}}>
        <nav className="-mb-px flex space-x-6 md:space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('applications')}
            className={`whitespace-nowrap pb-3 pt-1 px-1 border-b-2 font-medium text-base md:text-lg transition-all duration-200
              ${activeTab === 'applications'
                ? 'border-[#A41E22] text-[#A41E22]' /* Zenith Red */
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-[#C76A6E]' /* Lighter Zenith Red hover border */
              }`}
          >
            Account Applications <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'applications' ? 'bg-[#A41E22] text-white' : 'bg-gray-200 text-gray-700'}`}>{applications.filter(app => app.status === 'pending').length} pending</span> {/* Zenith Red for active count bg */}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap pb-3 pt-1 px-1 border-b-2 font-medium text-base md:text-lg transition-all duration-200
              ${activeTab === 'users'
                ? 'border-[#A41E22] text-[#A41E22]' /* Zenith Red */
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-[#C76A6E]' /* Lighter Zenith Red hover border */
              }`}
          >
            User Management <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'users' ? 'bg-[#A41E22] text-white' : 'bg-gray-200 text-gray-700'}`}>{users.length}</span> {/* Zenith Red for active count bg */}
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="anim-fadeInUp" style={{ animationDelay: '0.4s' }} key={activeTab}> {/* Key to re-trigger animation on tab change */}
        {activeTab === 'applications' && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-[#A41E22]">Account Applications</h2> {/* Zenith Red */}
            <div className="bg-white rounded-lg shadow-xl overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-100"> {/* Lighter gray for table header */}
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Applicant Name</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Desired Account</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.length > 0 ? applications.map((app: AccountApplication) => (
                    <tr key={app.id} className="hover:bg-red-50/30 transition-colors duration-150"> {/* Lighter Zenith Red hover */}
                      <td className="p-3 text-gray-800">{app.applicantName}</td>
                      <td className="p-3 text-gray-700">{app.email}</td>
                      <td className="p-3 text-gray-700">{app.desiredAccountType}</td>
                      <td className="p-3 text-gray-700">{new Date(app.dateSubmitted).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                          app.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-300' :
                          'bg-red-100 text-red-800 border border-red-300' 
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 space-x-2">
                        {app.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApplicationAction(app.id, 'approved')}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded font-semibold transition-all duration-200 hover:scale-105"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleApplicationAction(app.id, 'rejected')}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded font-semibold transition-all duration-200 hover:scale-105"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="p-4 text-center text-gray-500">No applications found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'users' && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-[#A41E22]">User Management</h2> {/* Zenith Red */}
            <div className="bg-white rounded-lg shadow-xl overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-100"> {/* Lighter gray for table header */}
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user: User) => (
                    <tr key={user.id} className="hover:bg-red-50/30 transition-colors duration-150"> {/* Lighter Zenith Red hover */}
                      <td className="p-3 text-gray-800">{user.username}</td>
                      <td className="p-3 text-gray-700">{user.email}</td>
                      <td className="p-3 text-gray-700 capitalize">{user.role}</td>
                      <td className="p-3 space-x-2">
                        <button className="text-blue-600 hover:text-blue-500 text-xs font-semibold hover:underline transition-colors">Edit</button>
                        <button className="text-orange-600 hover:text-orange-500 text-xs font-semibold hover:underline transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <button className="bg-[#A41E22] hover:bg-[#8C1A1F] text-white font-semibold py-2.5 px-5 rounded-md shadow hover:shadow-lg transition-all duration-200 hover:scale-105"> {/* Zenith Red button */}
                  Add New User (Mock)
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;