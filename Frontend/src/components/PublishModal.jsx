import React, { useState, useEffect } from 'react';
import { api, endpoints } from '../utils/api';

const PublishModal = ({ isOpen, onClose, formId, formTitle }) => {
  const [publishSettings, setPublishSettings] = useState({
    acceptingResponses: true,
    isPublic: true,
    allowedEmails: [],
    requireSignIn: false,
    limitToOneResponse: false,
    showProgressBar: false,
    confirmationMessage: "Thank you for your response!",
  });
  
  const [newEmail, setNewEmail] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [formLink, setFormLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (isOpen && formId) {
      // Generate form link
      const baseUrl = window.location.origin;
      setFormLink(`${baseUrl}/form/${formId}`);
      
      // Fetch current form settings
      fetchFormSettings();
    }
  }, [isOpen, formId]);

  const fetchFormSettings = async () => {
    try {
      const response = await api.get(endpoints.forms.getById(formId));
      const form = response.data.data.form;
      const settings = form.settings || {};
      
      setPublishSettings({
        acceptingResponses: form.acceptingResponses || true,
        isPublic: !settings.requireSignIn,
        allowedEmails: settings.allowedEmails || [],
        requireSignIn: settings.requireSignIn || false,
        limitToOneResponse: settings.limitToOneResponse || false,
        showProgressBar: settings.showProgressBar || false,
        confirmationMessage: settings.confirmationMessage || "Thank you for your response!",
      });
    } catch (error) {
      console.error('Error fetching form settings:', error);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Update form settings
      await api.patch(endpoints.forms.settings(formId), {
        settings: {
          requireSignIn: publishSettings.requireSignIn,
          limitToOneResponse: publishSettings.limitToOneResponse,
          showProgressBar: publishSettings.showProgressBar,
          confirmationMessage: publishSettings.confirmationMessage,
          allowedEmails: publishSettings.allowedEmails,
        },
        acceptingResponses: publishSettings.acceptingResponses,
      });
      
      console.log('✅ Form published successfully');
      onClose();
    } catch (error) {
      console.error('❌ Error publishing form:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const addEmail = () => {
    if (newEmail && !publishSettings.allowedEmails.includes(newEmail)) {
      setPublishSettings(prev => ({
        ...prev,
        allowedEmails: [...prev.allowedEmails, newEmail]
      }));
      setNewEmail('');
    }
  };

  const removeEmail = (emailToRemove) => {
    setPublishSettings(prev => ({
      ...prev,
      allowedEmails: prev.allowedEmails.filter(email => email !== emailToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Publish Form</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Form Link Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Share Form</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={formLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Response Collection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Response Collection</h3>
            <div className="space-y-4">
              
              {/* Accept Responses Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Accept responses</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Allow people to submit responses to this form</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishSettings.acceptingResponses}
                    onChange={(e) => setPublishSettings(prev => ({ ...prev, acceptingResponses: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Limit to One Response */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Limit to one response</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Each person can submit only one response</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishSettings.limitToOneResponse}
                    onChange={(e) => setPublishSettings(prev => ({ ...prev, limitToOneResponse: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Show Progress Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show progress bar</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Display completion progress to respondents</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishSettings.showProgressBar}
                    onChange={(e) => setPublishSettings(prev => ({ ...prev, showProgressBar: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Who can respond</h3>
            <div className="space-y-4">
              
              {/* Public/Restricted Radio */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="access"
                    checked={!publishSettings.requireSignIn}
                    onChange={() => setPublishSettings(prev => ({ ...prev, requireSignIn: false }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Anyone with the link</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="access"
                    checked={publishSettings.requireSignIn}
                    onChange={() => setPublishSettings(prev => ({ ...prev, requireSignIn: true }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Restricted (specific people)</span>
                </label>
              </div>

              {/* Email List for Restricted Access */}
              {publishSettings.requireSignIn && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allowed email addresses
                  </label>
                  
                  {/* Add Email Input */}
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                    />
                    <button
                      onClick={addEmail}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Email List */}
                  {publishSettings.allowedEmails.length > 0 && (
                    <div className="space-y-2">
                      {publishSettings.allowedEmails.map((email, index) => (
                        <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-600">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{email}</span>
                          <button
                            onClick={() => removeEmail(email)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmation message
            </label>
            <textarea
              value={publishSettings.confirmationMessage}
              onChange={(e) => setPublishSettings(prev => ({ ...prev, confirmationMessage: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Message shown after form submission"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPublishing ? 'Publishing...' : 'Publish Form'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
