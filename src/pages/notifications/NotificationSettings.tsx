import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bell, Mail, MessageSquare, Save } from 'lucide-react';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: {
      approvals: true,
      reminders: true,
      updates: false,
      marketing: false
    },
    inApp: {
      approvals: true,
      reminders: true,
      updates: true,
      marketing: false
    },
    sms: {
      approvals: false,
      reminders: false,
      updates: false,
      marketing: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Notification Settings</h1>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-md">
          Settings saved successfully!
        </div>
      )}

      <div className="grid gap-6">
        {/* Email Notifications */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-medium">Email Notifications</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(settings.email).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-sm text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={e => setSettings(s => ({
                    ...s,
                    email: { ...s.email, [key]: e.target.checked }
                  }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
              </label>
            ))}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-medium">In-App Notifications</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(settings.inApp).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-sm text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={e => setSettings(s => ({
                    ...s,
                    inApp: { ...s.inApp, [key]: e.target.checked }
                  }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
              </label>
            ))}
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-medium">SMS Notifications</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(settings.sms).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-sm text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={e => setSettings(s => ({
                    ...s,
                    sms: { ...s.sms, [key]: e.target.checked }
                  }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
              </label>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <label className="block text-sm text-foreground mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter your phone number to receive SMS notifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
