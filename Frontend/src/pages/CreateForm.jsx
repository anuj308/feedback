import React, { useState, useEffect, useContext, useCallback } from "react";
import { FormHead, InputCard, AutoSaveSettings, FormBuilderNavbar, PublishModal } from "../components/index";
import { useForms } from "../Context/StoreContext";
import { useNavigate, useParams, useLoaderData } from "react-router-dom";
import { api, endpoints } from "../utils/api";
import Admin from "./Admin";
import useAutoSave from "../hooks/useAutoSave";

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
  const [currentTab, setCurrentTab] = useState("create");
  const [showPublishModal, setShowPublishModal] = useState(false);

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
    
    const dataToSave = formData || {
      formTitle: headData.formTitle,
      formDescription: headData.formDescription,
      questions: questions,
      isAutoSave: true, // Flag to indicate this is an auto-save
    };

    console.log("💾 Auto-saving form:", { formId: fId, questionsCount: questions.length });
    
    const response = await api.post(endpoints.forms.update(fId), dataToSave);
    console.log("✅ Form auto-saved successfully");
    
    setLastSavedTime(new Date().toISOString());
    setSaveError(null);
    
    return response;
  };

  // Setup auto-save hook
  const { isSaving, hasUnsavedChanges, manualSave } = useAutoSave(
    autoSaveForm,
    { headData, questions },
    {
      delay: autoSaveSettings.autoSaveInterval, // Use settings interval
      enabled: !!fId && !autoSaveSettings.disableAutoSave, // Use settings enabled flag
      onSaveStart: () => setSaveError(null),
      onSaveSuccess: () => setLastSavedTime(new Date().toISOString()),
      onSaveError: (error) => {
        console.error("❌ Auto-save failed:", error);
        setSaveError(error.message || "Auto-save failed");
      },
    }
  );

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
    console.log("🔧 Auto-save settings updated:", newSettings);
  };

  const handleSave = async () => {
    if (manualSave) {
      await manualSave();
    }
  };

  const handlePublish = () => {
    setShowPublishModal(true);
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const onChangeHandler = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    setHeadData((prev) => ({ ...prev, [name]: value }));
  };

  const updateForm = async () => {
    console.log("💾 Updating form:", { formId: fId, questionsCount: questions.length });
    try {
      const response = await api.post(endpoints.forms.update(fId), {
        formTitle: headData.formTitle,
        formDescription: headData.formDescription,
        questions: questions,
      });
      console.log("✅ Form updated successfully");
      setHead({
        formTitle: "Untitled Form",
        formDescription: "",
      });
      navigate("/");
    } catch (error) {
      console.error("❌ Error updating form:", error);
    }
  };

  useEffect(() => {
    const func = async () => {
      console.log("📖 Loading form data for formId:", fId);
      try {
        const response = await api.get(endpoints.forms.getById(fId));
        const form = response.data.data.form;
        
        console.log("📄 Form loaded:", { 
          title: form.formTitle, 
          questionsCount: form.questions?.length || 0 
        });
        
        setHead({
          formTitle: form.formTitle,
          formDescription: form.formDescription,
        });
        
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

  // Helper function to extract options from legacy structure
  const extractOptions = (legacyItem) => {
    const options = [];
    if (legacyItem.multipleChoice) {
      options.push(...legacyItem.multipleChoice.map(mc => mc.value).filter(v => v));
    }
    if (legacyItem.checkBoxes) {
      options.push(...legacyItem.checkBoxes.map(cb => cb.value).filter(v => v));
    }
    return options;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navbar */}
      <FormBuilderNavbar
        formTitle={headData.formTitle || "Untitled Form"}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onPublish={handlePublish}
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content with top padding for fixed navbar */}
      <div className="pt-16">
        {/* Tab Content */}
        {currentTab === "create" && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            
            {/* Form Builder Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              
              {/* Form Header */}
              <div className="p-6 border-b border-gray-200">
                <FormHead headData={headData} onChangeHandler={onChangeHandler} />
              </div>

              {/* Questions Section */}
              <div className="p-6">
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={question.questionId} className="border border-gray-200 rounded-lg overflow-hidden">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Settings</h2>
              
              {/* Auto-save Settings */}
              <AutoSaveSettings 
                formId={fId}
                onSettingsChange={handleAutoSaveSettingsChange}
              />
              
              {/* Additional settings can go here */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">More Settings Coming Soon</h3>
                <p className="text-gray-600">Additional form customization options will be available here.</p>
              </div>
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
      />
    </div>
  );
};

export default CreateForm;
