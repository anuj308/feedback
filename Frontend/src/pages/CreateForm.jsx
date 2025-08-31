import React, { useState, useEffect, useContext, useCallback } from "react";
import { Button, FormHead, InputCard, AutoSaveSettings } from "../components/index";
import { useForms } from "../Context/StoreContext";
import { useNavigate, useParams, useLoaderData } from "react-router-dom";
import { api, endpoints } from "../utils/api";
import Admin from "./Admin";
import useAutoSave from "../hooks/useAutoSave";
import SaveStatusIndicator from "../components/SaveStatusIndicator";

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
  const [showSettings, setShowSettings] = useState(false);

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

  const [page, setPage] = useState("create");

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
    <div>
      <div className=" flex flex-row justify-evenly mx-auto mt-20 md:w-1/2 rounded overflow-hidden shadow-lg">
        <div className={`${ page=='create' ? "bg-red-600" : ""} p-3 hover:bg-gray-900 hover:text-white`} onClick={() => setPage("create")}>
          create
        </div>
        <div className={`${ page=='admin' ? "bg-red-600" : ""} p-3 hover:bg-gray-900 hover:text-white`} onClick={() => setPage("admin")}>
          admin
        </div>
      </div>
      {
        page === "create" ? (
          <div className="mx-auto md:w-1/2 mt-14 rounded overflow-hidden shadow-lg ">
            {/* Save Status Indicator */}
            <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b">
              <SaveStatusIndicator 
                isSaving={isSaving}
                hasUnsavedChanges={hasUnsavedChanges}
                lastSavedTime={lastSavedTime}
              />
              <div className="flex items-center gap-3">
                {saveError && (
                  <div className="text-red-600 text-sm">
                    ⚠️ {saveError}
                  </div>
                )}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
                  title="Auto-save settings"
                >
                  ⚙️ Settings
                </button>
              </div>
            </div>

            {/* Auto-Save Settings */}
            {showSettings && (
              <div className="px-6 py-4 bg-gray-50 border-b">
                <AutoSaveSettings 
                  formId={fId}
                  onSettingsChange={handleAutoSaveSettingsChange}
                />
              </div>
            )}
            
            <FormHead headData={headData} onChangeHandler={onChangeHandler} />
            <div className="my-8 ">
              {questions.map((question, index) => {
                return (
                  <div key={question.questionId}>
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
                );
              })}
              
              {/* Add new question button */}
              <div className="mx-auto md:w-1/2 mt-4">
                <Button 
                  onClick={() => addQuestion(createNewQuestion())} 
                  className="w-full mb-4 bg-blue-500 hover:bg-blue-600"
                >
                  Add Question
                </Button>
              </div>
            </div>
            
            {/* Updated Done button with manual save */}
            <div className="flex gap-4 px-6 pb-6">
              <Button 
                onClick={() => manualSave().then(() => navigate("/"))} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Done"}
              </Button>
              
              <Button 
                onClick={() => manualSave()} 
                className="px-6 bg-gray-600 hover:bg-gray-700"
                disabled={isSaving}
              >
                Save Now
              </Button>
            </div>
          </div>
        ) : (
          <Admin formId={fId} />
        )
      }
    </div>
  );
};

export default CreateForm;
