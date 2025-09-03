import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowLeft, ChevronRight, Lock, FileText, LogOut, Trash2 } from 'lucide-react';
import { RootState } from '@/store/store'; // Adjust this import path to match your store setup
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.profile);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleGoBack = () => {
    // Add navigation logic here - could use react-router
    // window.history.back();
    console.log('Navigate back');
  };

  const handleChangePassword = () => {
    // Add navigation logic here - could use react-router
    navigate('/settings/change-password');
    console.log('Navigate to change password page');
  };

  const handleTermsOfUse = () => {
    console.log('Navigate to terms of use');
  };

  const handleLogOut = () => {
    console.log('Log out user');
    // Add logout logic here
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    console.log('Delete account confirmed');
    setShowDeleteConfirm(false);
    // Add delete account logic here
  };

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteAccount}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={profile?.avatar || '/api/placeholder/60/60'}
                alt="Profile"
                className="w-15 h-15 rounded-full object-cover bg-gray-200"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 text-lg">
                {profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username || 'User' : 'User'}
              </h2>
              <p className="text-gray-500 text-sm">
                {profile?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-4">
          {/* Change Password */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={handleChangePassword}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-500">Update and strengthen account security</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Terms of Use */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={handleTermsOfUse}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900">Terms of Use</h3>
                <p className="text-sm text-gray-500">Protect your account now</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Log Out */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={handleLogOut}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <LogOut className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900">Log Out</h3>
                <p className="text-sm text-gray-500">Securely log out of account</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Delete Account */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={handleDeleteAccount}
              className="w-full p-4 flex items-center gap-4 hover:bg-red-50 transition-colors rounded-lg group"
            >
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-red-600">Delete Account</h3>
                <p className="text-sm text-gray-500">Permanently remove your account</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* App Version */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;