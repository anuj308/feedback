import React, { useState, useEffect } from 'react';
import { api, endpoints } from '../utils/api';

const AutoSaveSettings = ({ formId, onSettingsChange }) => {
  const [settings, setSettings] = useState({
    disableAutoSave: false,
    autoSaveInterval: 2000,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFormSettings = async () => {
      if (!formId) return;
      
      try {
        const response = await api.get(endpoints.forms.getById(formId));
        const formSettings = response.data.data.form.settings || {};
        setSettings({
          disableAutoSave: formSettings.disableAutoSave || false,
          autoSaveInterval: formSettings.autoSaveInterval || 2000,
        });
      } catch (error) {
        console.error('Error fetching form settings:', error);
      }
    };

    fetchFormSettings();
  }, [formId]);

  const updateSettings = async (newSettings) => {
    setLoading(true);
    try {
      await api.patch(endpoints.forms.settings(formId), {
        settings: newSettings
      });
      setSettings(newSettings);
      onSettingsChange?.(newSettings);
      console.log('✅ Auto-save settings updated');
    } catch (error) {
      console.error('❌ Error updating auto-save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoSave = () => {
    const newSettings = {
      ...settings,
      disableAutoSave: !settings.disableAutoSave
    };
    updateSettings(newSettings);
  };

  const handleIntervalChange = (interval) => {
    const newSettings = {
      ...settings,
      autoSaveInterval: interval
    };
    updateSettings(newSettings);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Auto-Save Settings</h3>
      
      {/* Auto-save toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enable Auto-Save
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Automatically save form changes as you type
          </p>
        </div>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            checked={!settings.disableAutoSave}
            onChange={handleToggleAutoSave}
            disabled={loading}
          />
        </label>
      </div>

      {/* Auto-save interval */}
      {!settings.disableAutoSave && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Auto-Save Interval
          </label>
          <select
            value={settings.autoSaveInterval}
            onChange={(e) => handleIntervalChange(Number(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={loading}
          >
            <option value={1000}>1 second (Immediate)</option>
            <option value={2000}>2 seconds (Recommended)</option>
            <option value={3000}>3 seconds</option>
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            How long to wait after changes before auto-saving
          </p>
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Updating settings...
        </div>
      )}
    </div>
  );
};

export default AutoSaveSettings;
