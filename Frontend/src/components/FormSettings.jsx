import React, { useState, useEffect } from 'react';
import { api, endpoints } from '../utils/api';

const FormSettings = ({ formId, onSettingsChange, refreshTrigger }) => {
  const [settings, setSettings] = useState({
    // General settings
    isQuiz: false,
    collectEmail: false,
    requireSignIn: false,
    limitToOneResponse: false,
    allowResponseEditing: true,
    showProgressBar: false,
    shuffleQuestions: false,
    confirmationMessage: "Thank you for your response!",
    showResultsSummary: false,
    
    // Auto-save settings
    disableAutoSave: false,
    autoSaveInterval: 2000,
    
    // Access control
    allowedEmails: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    const fetchFormSettings = async () => {
      if (!formId) return;
      
      try {
        const response = await api.get(endpoints.forms.getById(formId));
        const form = response.data.data.form;
        
        // Update settings from backend
        if (form.settings) {
          setSettings({
            isQuiz: form.settings.isQuiz || false,
            collectEmail: form.settings.collectEmail || false,
            requireSignIn: form.settings.requireSignIn || false,
            limitToOneResponse: form.settings.limitToOneResponse || false,
            allowResponseEditing: form.settings.allowResponseEditing !== false,
            showProgressBar: form.settings.showProgressBar || false,
            shuffleQuestions: form.settings.shuffleQuestions || false,
            confirmationMessage: form.settings.confirmationMessage || "Thank you for your response!",
            showResultsSummary: form.settings.showResultsSummary || false,
            disableAutoSave: form.settings.disableAutoSave || false,
            autoSaveInterval: form.settings.autoSaveInterval || 2000,
            allowedEmails: form.settings.allowedEmails || [],
          });
        }
        
      } catch (error) {
        console.error('Error fetching form settings:', error);
      }
    };

    fetchFormSettings();
  }, [formId, refreshTrigger]);

  const updateSettings = async (newSettings) => {
    setLoading(true);
    try {
      const updateData = { settings: newSettings };
      
      await api.patch(endpoints.forms.settings(formId), updateData);
      setSettings(newSettings);
      
      // Notify parent component about auto-save settings changes
      if (onSettingsChange) {
        onSettingsChange({
          disableAutoSave: newSettings.disableAutoSave,
          autoSaveInterval: newSettings.autoSaveInterval,
        });
      }
      
      console.log('✅ Form settings updated');
    } catch (error) {
      console.error('❌ Error updating form settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    updateSettings(newSettings);
  };

  const addAllowedEmail = () => {
    if (emailInput && !settings.allowedEmails.includes(emailInput)) {
      const newEmails = [...settings.allowedEmails, emailInput];
      const newSettings = { ...settings, allowedEmails: newEmails };
      updateSettings(newSettings);
      setEmailInput('');
    }
  };

  const removeAllowedEmail = (email) => {
    const newEmails = settings.allowedEmails.filter(e => e !== email);
    const newSettings = { ...settings, allowedEmails: newEmails };
    updateSettings(newSettings);
  };

  const SettingToggle = ({ label, description, checked, onChange, disabled = false }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled || loading}
        />
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
        
        <div className="space-y-1">
          <SettingToggle
            label="Make this a quiz"
            description="Enable quiz mode with correct answers and scoring"
            checked={settings.isQuiz}
            onChange={(value) => handleSettingChange('isQuiz', value)}
          />
          
          <SettingToggle
            label="Collect email addresses"
            description="Automatically collect respondent email addresses"
            checked={settings.collectEmail}
            onChange={(value) => handleSettingChange('collectEmail', value)}
          />
          
          <SettingToggle
            label="Require sign in"
            description="Require users to sign in before responding"
            checked={settings.requireSignIn}
            onChange={(value) => handleSettingChange('requireSignIn', value)}
          />
          
          <SettingToggle
            label="Limit to one response per person"
            description="Prevent multiple submissions from the same user"
            checked={settings.limitToOneResponse}
            onChange={(value) => handleSettingChange('limitToOneResponse', value)}
          />
          
          <SettingToggle
            label="Allow response editing"
            description="Let users edit their responses after submission"
            checked={settings.allowResponseEditing}
            onChange={(value) => handleSettingChange('allowResponseEditing', value)}
          />
        </div>
      </div>

      {/* Presentation Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Presentation</h3>
        
        <div className="space-y-1">
          <SettingToggle
            label="Show progress bar"
            description="Display a progress bar to respondents"
            checked={settings.showProgressBar}
            onChange={(value) => handleSettingChange('showProgressBar', value)}
          />
          
          <SettingToggle
            label="Shuffle question order"
            description="Randomize the order of questions for each respondent"
            checked={settings.shuffleQuestions}
            onChange={(value) => handleSettingChange('shuffleQuestions', value)}
          />
          
          <SettingToggle
            label="Show results summary"
            description="Show response summary to users after submission"
            checked={settings.showResultsSummary}
            onChange={(value) => handleSettingChange('showResultsSummary', value)}
          />
        </div>

        {/* Confirmation Message */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirmation Message
          </label>
          <textarea
            value={settings.confirmationMessage}
            onChange={(e) => handleSettingChange('confirmationMessage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={3}
            placeholder="Thank you for your response!"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Message shown to users after they submit the form
          </p>
        </div>
      </div>

      {/* Auto-Save Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Auto-Save Settings</h3>
        
        <SettingToggle
          label="Enable Auto-Save"
          description="Automatically save form changes as you type"
          checked={!settings.disableAutoSave}
          onChange={(value) => handleSettingChange('disableAutoSave', !value)}
        />

        {!settings.disableAutoSave && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auto-Save Interval
            </label>
            <select
              value={settings.autoSaveInterval}
              onChange={(e) => handleSettingChange('autoSaveInterval', Number(e.target.value))}
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
      </div>

      {/* Access Control */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Access Control</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Allowed Email Addresses
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Restrict form access to specific email addresses (leave empty for public access)
          </p>
          
          {/* Add Email Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAllowedEmail()}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={loading}
            />
            <button
              onClick={addAllowedEmail}
              disabled={loading || !emailInput}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
          
          {/* Email List */}
          {settings.allowedEmails.length > 0 && (
            <div className="space-y-2">
              {settings.allowedEmails.map((email, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-sm text-gray-900 dark:text-white">{email}</span>
                  <button
                    onClick={() => removeAllowedEmail(email)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 disabled:text-gray-400 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Updating settings...
        </div>
      )}
    </div>
  );
};

export default FormSettings;
