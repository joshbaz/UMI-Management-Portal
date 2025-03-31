import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import { RiNotificationLine, RiLockLine, RiUserLine, RiGlobalLine } from 'react-icons/ri';

const SettingSection = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Icon className="w-5 h-5 text-primary-500" />
      </div>
      <h2 className="text-lg font-medium text-semantic-text-primary">{title}</h2>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const Settings = () => {
  return (
    <div className="p-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account settings and preferences"
      />

      <div className="grid gap-6">
        {/* Profile Settings */}
        <SettingSection icon={RiUserLine} title="Profile Settings">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-semantic-text-primary">Profile Picture</h3>
              <p className="text-sm text-semantic-text-secondary">Update your profile photo</p>
            </div>
            <button className="px-4 py-2 text-sm text-primary-500 border border-primary-500 rounded-md hover:bg-blue-50">
              Change
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-semantic-text-primary">Personal Information</h3>
              <p className="text-sm text-semantic-text-secondary">Update your personal details</p>
            </div>
            <button className="px-4 py-2 text-sm text-primary-500 border border-primary-500 rounded-md hover:bg-blue-50">
              Edit
            </button>
          </div>
        </SettingSection>

        {/* Security Settings */}
        <SettingSection icon={RiLockLine} title="Security Settings">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-semantic-text-primary">Password</h3>
              <p className="text-sm text-semantic-text-secondary">Change your password</p>
            </div>
            <button className="px-4 py-2 text-sm text-primary-500 border border-primary-500 rounded-md hover:bg-blue-50">
              Update
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-semantic-text-primary">Two-Factor Authentication</h3>
              <p className="text-sm text-semantic-text-secondary">Add extra security to your account</p>
            </div>
            <button className="px-4 py-2 text-sm text-white bg-primary-500 rounded-md hover:bg-primary-600">
              Enable
            </button>
          </div>
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection icon={RiNotificationLine} title="Notification Settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-semantic-text-primary">Email Notifications</h3>
                <p className="text-sm text-semantic-text-secondary">Receive email updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-semantic-text-primary">Push Notifications</h3>
                <p className="text-sm text-semantic-text-secondary">Receive push notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </SettingSection>

        {/* System Settings */}
        <SettingSection icon={RiGlobalLine} title="System Settings">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-semantic-text-primary">Language</h3>
              <p className="text-sm text-semantic-text-secondary">Select your preferred language</p>
            </div>
            <select className="px-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-semantic-text-primary">Time Zone</h3>
              <p className="text-sm text-semantic-text-secondary">Set your local time zone</p>
            </div>
            <select className="px-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="utc">UTC</option>
              <option value="est">EST</option>
              <option value="pst">PST</option>
            </select>
          </div>
        </SettingSection>
      </div>
    </div>
  );
};

export default Settings;
