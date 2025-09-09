import React, { useState, useEffect, useContext, useCallback } from "react";
import { FormHead, InputCard, FormSettings, FormBuilderNavbar, PublishModal, Toast } from "../components/index";
import { useForms } from "../Context/StoreContext";
import { useNavigate, useParams, useLoaderData } from "react-router-dom";
import { api, endpoints } from "../utils/api";
import Admin from "./Admin";
import useAutoSave from "../hooks/useAutoSave";
import useToast from "../hooks/useToast";
import { usePageTitle } from "../hooks/usePageTitle";

const CreateForm = () => {
  const navigate = useNavigate();
  const { fId } = useParams();
  const { isAuthenticated } = useForms();

  const [questions, setQuestions] = useState([]);
  const [headData, setHeadData] = useState({});
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [autoSaveSettings, setAutoSaveSettings] = useState({
    disableAutoSave: false,
    autoSaveInterval: 2000,
  });
  const [formSettings, setFormSettings] = useState({
    isQuiz: false,
    collectEmail: false,
    requireSignIn: false,
    limitToOneResponse: false,
    allowResponseEditing: true,
    showProgressBar: false,
    shuffleQuestions: false,
    confirmationMessage: "Thank you for your response!",
    showResultsSummary: false,
    disableAutoSave: false,
    autoSaveInterval: 2000,
    allowedEmails: [],
  });
  const [currentTab, setCurrentTab] = useState("create");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [settingsRefreshTrigger, setSettingsRefreshTrigger] = useState(0);

  // Set dynamic page title based on form title
  usePageTitle(headData.title ? `Edit: ${headData.title} - Feedback Form Builder` : "Create Form - Feedback Form Builder");
  const [isPublished, setIsPublished] = useState(false);
  const [acceptingResponses, setAcceptingResponses] = useState(false);

  // Toast notifications
  const toast = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("🔐 Not authenticated, redirecting to login");
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Clear form data when user is no longer authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("🧹 User not authenticated, clearing form data");
      setQuestions([]);
      setHeadData({});
    }
  }, [isAuthenticated]);

  // Helper function to create a new question
  const createNewQuestion = () => ({
    questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: "shortAnswer",
    question: "",
    description: "",
    titlePlaceholder: "Question", 
    descriptionPlaceholder: "Description",
    required: false,
    options: []
  });

  // Auto-save function (separated from manual save)
  const autoSaveForm = async (formData = null) => {
    if (!fId) return;
    
    const dataToSave =  {
      formTitle: headData.formTitle,
      formDescription: headData.formDescription,
      questions: questions,
      isAutoSave: true,
    };

  
    const response = await api.post(endpoints.forms.update(fId), dataToSave);
    console.log("✅ Form auto-saved successfully");
    
    setLastSavedTime(new Date().toISOString());
    setSaveError(null);
    
    return response;
  };

  // Setup auto-save hook
  const { isSaving, hasUnsavedChanges, manualSave, forceSave } = useAutoSave(
    autoSaveForm,
    { headData, questions },
    {
      delay: autoSaveSettings.autoSaveInterval, // Use settings interval
      enabled: !!fId && !autoSaveSettings.disableAutoSave, // Use settings enabled flag
      onSaveStart: () => {
        setSaveError(null);
        // Optional: Show subtle saving indicator for manual saves
      },
      onSaveSuccess: () => {
        setLastSavedTime(new Date().toISOString());
        // Optional: Show brief success toast for manual saves only
      },
      onSaveError: (error) => {
        console.error("❌ Auto-save failed:", error);
        setSaveError(error.message || "Auto-save failed");
        toast.showErrorToast("Auto-save failed. Please try saving manually.");
      },
    }
  );

  // Handle browser beforeunload event for auto-save on navigation/close
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges && !autoSaveSettings.disableAutoSave) {
        // Try to auto-save synchronously (limited by browser constraints)
        if (forceSave) {
          // Use sendBeacon for reliable background save attempt
          try {
            navigator.sendBeacon && forceSave().catch(() => {
              console.log("Background save attempt failed during page unload");
            });
          } catch (error) {
            console.log("Could not attempt background save during page unload");
          }
        }
        
        // Show browser's default confirmation dialog
        event.preventDefault();
        event.returnValue = 'You have unsaved changes that will be lost.';
        return 'You have unsaved changes that will be lost.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, forceSave, autoSaveSettings.disableAutoSave]);

  const addQuestion = useCallback((info) => {
    const newQuestion = { ...createNewQuestion(), ...info };
    setQuestions((prev) => [...prev, newQuestion]);
    // Force immediate save for critical actions
    if (manualSave) {
      setTimeout(() => manualSave(), 100);
    }
  }, [manualSave]);

  const updateQuestion = useCallback((questionId, info) => {
    setQuestions((prev) => 
      prev.map((question) => 
        question.questionId === questionId ? { ...question, ...info } : question
      )
    );
  }, []);

  const deleteQuestion = useCallback((questionId) => {
    setQuestions((prev) => prev.filter((question) => question.questionId !== questionId));
    // Force immediate save for critical actions
    if (manualSave) {
      setTimeout(() => manualSave(), 100);
    }
  }, [manualSave]);

  const setHead = (info) => {
    setHeadData(info);
  };

  const handleAutoSaveSettingsChange = (newSettings) => {
    setAutoSaveSettings(newSettings);
    
    // Also update the form settings state
    setFormSettings(prev => ({
      ...prev,
      disableAutoSave: newSettings.disableAutoSave,
      autoSaveInterval: newSettings.autoSaveInterval,
    }));
    
    console.log("🔧 Auto-save settings updated:", newSettings);
  };

  const handleSave = async () => {
    if (manualSave) {
      const toastId = toast.showSavingToast("Saving form...");
      try {
        await manualSave();
        toast.hideToast(toastId);
        toast.showSuccessToast("Form saved successfully!");
      } catch (error) {
        toast.hideToast(toastId);
        toast.showErrorToast("Failed to save form");
      }
    }
  };

  const handleForceSave = async () => {
    if (forceSave) {
      try {
        await forceSave();
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  const handlePublish = () => {
    setShowPublishModal(true);
  };

  const handleToggleResponses = async () => {
    try {
      await api.patch(endpoints.forms.settings(fId), {
        acceptingResponses: !acceptingResponses
      });
      
      setAcceptingResponses(!acceptingResponses);
      console.log(`✅ Accepting responses ${!acceptingResponses ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('❌ Error toggling responses:', error);
    }
  };

  const handleSettingsUpdated = async () => {
    // Refresh form data after settings are updated
    try {
      const response = await api.get(endpoints.forms.getById(fId));
      const form = response.data.data.form;
      
      console.log("🔄 Refreshing form data after settings update");
      
      setHeadData({
        formTitle: form.formTitle,
        formDescription: form.formDescription,
      });
      
      // Update publish status
      setIsPublished(form.isPublished || false);
      setAcceptingResponses(form.acceptingResponses || false);
      
      // Update form settings
      if (form.settings) {
        const settings = {
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
        };
        
        setFormSettings(settings);
        
        // Update auto-save specific settings for the hook
        setAutoSaveSettings({
          disableAutoSave: settings.disableAutoSave,
          autoSaveInterval: settings.autoSaveInterval,
        });
      }
      
      // Trigger FormSettings refresh
      setSettingsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("❌ Error refreshing form data:", error);
    }
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const onChangeHandler = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    setHeadData((prev) => ({ ...prev, [name]: value }));
  };


 

  useEffect(() => {
    const func = async () => {
      console.log("📖 Loading form data for editing, formId:", fId);
      try {
        const response = await api.get(endpoints.forms.getForEdit(fId));
        const form = response.data.data.form;
        
        console.log("📄 Form loaded for editing:", { 
          title: form.formTitle, 
          questionsCount: form.questions?.length || 0 
        });
        
        setHeadData({
          formTitle: form.formTitle,
          formDescription: form.formDescription,
        });
        
        // Set publish status
        setIsPublished(form.isPublished || false);
        setAcceptingResponses(form.acceptingResponses || false);
        
        // Load form settings
        if (form.settings) {
          const settings = {
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
          };
          
          setFormSettings(settings);
          
          // Update auto-save specific settings for the hook
          setAutoSaveSettings({
            disableAutoSave: settings.disableAutoSave,
            autoSaveInterval: settings.autoSaveInterval,
          });
        }
        
        // Use new questions structure only
        if (form.questions && form.questions.length > 0) {
          setQuestions(form.questions);
        } else {
          // Initialize with one empty question if no questions exist
          setQuestions([createNewQuestion()]);
        }
      } catch (error) {
        console.log("Error while fetching the create form", error);
        // Initialize with one empty question on error
        setQuestions([createNewQuestion()]);
      }
    };
    func();
  }, []);

      return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Fixed Navbar */}
      <FormBuilderNavbar
        formTitle={headData.formTitle || "Untitled Form"}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onForceSave={handleForceSave}
        onPublish={handlePublish}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        isPublished={isPublished}
        acceptingResponses={acceptingResponses}
        onToggleResponses={handleToggleResponses}
        onShowToast={toast}
      />

      {/* Main Content with top padding for fixed navbar */}
      <div className="pt-16 ">
        {/* Tab Content */}
        {currentTab === "create" && (
          <div className="max-w-4xl mx-auto px-4 py-8 ">
            
            {/* Form Builder Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              
              {/* Form Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <FormHead headData={headData} onChangeHandler={onChangeHandler} />
              </div>

              {/* Questions Section */}
              <div className="p-6">
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={question.questionId} className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
                      <InputCard
                        question={question}
                        questionId={question.questionId}
                        type={question.type}
                        questionText={question.question}
                        description={question.description}
                        titlePlaceholder={question.titlePlaceholder}
                        descriptionPlaceholder={question.descriptionPlaceholder}
                        required={question.required}
                        options={question.options || []}
                        addQuestion={addQuestion}
                        updateQuestion={updateQuestion}
                        deleteQuestion={deleteQuestion}
                        questions={questions}
                      />
                    </div>
                  ))}
                  
                  {/* Add Question Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => addQuestion(createNewQuestion())}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Responses Tab */}
        {currentTab === "responses" && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Admin formId={fId} />
          </div>
        )}

        {/* Settings Tab */}
        {currentTab === "settings" && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Form Settings</h2>
              
              {/* Comprehensive Form Settings */}
              <FormSettings 
                formId={fId}
                onSettingsChange={handleAutoSaveSettingsChange}
                refreshTrigger={settingsRefreshTrigger}
              />
            </div>
          </div>
        )}
      </div>

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        formId={fId}
        formTitle={headData.formTitle || "Untitled Form"}
        onSettingsUpdated={handleSettingsUpdated}
        isPublished={isPublished}
      />

      {/* Toast Notifications */}
      {toast.toasts.map((toastItem) => (
        <Toast
          key={toastItem.id}
          message={toastItem.message}
          type={toastItem.type}
          isVisible={toastItem.isVisible}
          onClose={() => toast.hideToast(toastItem.id)}
          duration={toastItem.duration}
        />
      ))}
    </div>
  );
};

export default CreateForm;
