import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, endpoints } from "../utils/api";
import { FormHead, Button, FormCard, Toast } from "../components/index";
import { useToast } from "../hooks/useToast";
import { usePageTitle } from "../hooks/usePageTitle";

const Form = () => {
  const { fId } = useParams();
  const navigate = useNavigate();
  const { toasts, showSuccessToast, showErrorToast, hideToast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSettings, setFormSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  // Set dynamic page title based on form title
  usePageTitle(formTitle ? `${formTitle} - Feedback Form Builder` : "Form - Feedback Form Builder");

  const updateAnswer = (questionId, answer) => {
    setAnswers((prev) => {
      const existingAnswerIndex = prev.findIndex(a => a.questionId === questionId);
      if (existingAnswerIndex >= 0) {
        // Update existing answer
        const newAnswers = [...prev];
        newAnswers[existingAnswerIndex] = { questionId, answer };
        return newAnswers;
      } else {
        // Add new answer
        return [...prev, { questionId, answer }];
      }
    });
  };

  const storeForm = async () => {
    try {
      // Validate required questions
      const requiredQuestions = questions.filter(q => q.required);
      const answeredQuestions = answers.map(a => a.questionId);
      
      const missingRequired = requiredQuestions.filter(q => 
        !answeredQuestions.includes(q.questionId)
      );
      
      if (missingRequired.length > 0) {
        console.warn("❌ Missing required answers:", missingRequired.map(q => q.question));
        showErrorToast("Please answer all required questions");
        return;
      }

      // Use main endpoint for form submission (backend handles auth)
      const submissionData = {
        formId: fId,
        answers: answers,
      };

      // Add email if collecting email and not signed in
      if (formSettings.collectEmail && userEmail) {
        submissionData.email = userEmail;
      }

      const response = await api.post(endpoints.store.submit, submissionData);
      
      // Show success message based on form settings
      const message = formSettings.confirmationMessage || "Thank you for your response!";
      showSuccessToast(message);
      
      // If showResultsSummary is enabled, show summary (for future implementation)
      if (formSettings.showResultsSummary) {
        // Could implement results summary here
      }
      
      // Navigate after a short delay to let user see the success message
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("❌ Error while sending data to server:", error);
      
      if (error.response?.status === 400) {
        showErrorToast(error.response.data.message || "Error submitting response");
      } else if (error.response?.status === 401) {
        showErrorToast("You need to sign in to submit this form");
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.response?.status === 403) {
        if (error.response.data.message?.includes("not published")) {
          showErrorToast("This form is not published");
        } else if (error.response.data.message?.includes("not authorized")) {
          showErrorToast("You are not authorized to submit responses to this form");
        } else {
          showErrorToast("Access denied");
        }
        setTimeout(() => navigate("/"), 2000);
      } else if (error.response?.status === 429) {
        // Rate limiting error - show the specific message from backend
        showErrorToast(error.response.data.message || "Too many requests. Please wait before trying again.");
      } else {
        showErrorToast("Error submitting response. Please try again.");
      }
    }
  };

  useEffect(() => {
    const func = async () => {
      console.log("📖 Loading form data for formId:", fId);
      try {
        setLoading(true);
        // Use main endpoint to fetch form data (auth handled in backend)
        const response = await api.get(endpoints.forms.getById(fId));
        console.log("📋 Raw API Response:", response.data);
        
        const form = response.data.data.form;
        console.log("📄 Form object:", form);
        
        console.log("📄 Form loaded for submission:", { 
          title: form.formTitle, 
          questionsCount: form.questions?.length || 0,
          settings: form.settings,
          hasQuestions: !!form.questions,
          questionsArray: form.questions
        });
        
        setFormTitle(form.formTitle);
        setFormDescription(form.formDescription);
        setFormSettings(form.settings || {});
        
        // Use new questions structure only
        if (form.questions && form.questions.length > 0) {
          let questionsToSet = [...form.questions];
          
          // Shuffle questions if setting is enabled
          if (form.settings?.shuffleQuestions) {
            questionsToSet = questionsToSet.sort(() => Math.random() - 0.5);
          }
          
          console.log("📝 Setting questions:", questionsToSet);
          setQuestions(questionsToSet);
        } else {
          console.warn("⚠️ No questions found in form", { 
            questions: form.questions, 
            questionsLength: form.questions?.length,
            formKeys: Object.keys(form) 
          });
        }
        
        // Try to get user email if they're logged in (for email collection)
        if (form.settings?.collectEmail) {
          try {
            const userResponse = await api.get(endpoints.auth.currentUser);
            setUserEmail(userResponse.data.data.user.email);
          } catch (error) {
            // User not logged in, but that's OK for public forms
            console.log("User not logged in, but form doesn't require sign-in");
          }
        }
        
      } catch (error) {
        console.error("Error while fetching form", error);
        if (error.response?.status === 404) {
          showErrorToast("Form not found");
          setTimeout(() => navigate("/"), 2000);
        } else if (error.response?.status === 401) {
          showErrorToast("Please sign in to access this form. Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
        } else if (error.response?.status === 403) {
          if (error.response.data.message?.includes("not published")) {
            showErrorToast("This form is not published");
          } else if (error.response.data.message?.includes("Authentication required")) {
            showErrorToast("Please sign in to access this form. Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
          } else {
            showErrorToast("Access denied");
            setTimeout(() => navigate("/"), 2000);
          }
        } else if (error.response?.status === 429) {
          // Rate limiting error when loading form
          showErrorToast("Too many requests. Please wait a moment before trying again.");
        } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          // Timeout error
          showErrorToast("Request timed out. Please check your connection and try again.");
        } else {
          showErrorToast("Error loading form. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    func();
  }, [fId, navigate]);

  return (
    <>
      {loading ? (
        <div className="mx-auto md:w-1/2 mt-14 rounded overflow-hidden shadow-lg">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-t"></div>
          <div className="p-6 space-y-4">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 rounded"></div>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="mx-auto md:w-1/2 mt-14 rounded overflow-hidden shadow-lg">
          <FormHead 
            headData={{ formTitle, formDescription }} 
            readOnly={true}
          />
          
          {formSettings.showProgressBar && questions.length > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mx-6 my-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${Math.round((answers.filter(a => a.answer && a.answer !== '').length / questions.length) * 100)}%` 
                }}
              ></div>
              <div className="text-xs text-gray-500 text-center mt-1">
                {answers.filter(a => a.answer && a.answer !== '').length} of {questions.length} questions answered
              </div>
            </div>
          )}
          
          <div className="my-8">
            {questions.map((question, index) => (
              <div key={question.questionId}>
                <FormCard
                  question={question}
                  questionId={question.questionId}
                  type={question.type}
                  questionText={question.question}
                  description={question.description}
                  required={question.required}
                  options={question.options || []}
                  updateAnswer={updateAnswer}
                  currentAnswer={answers.find(a => a.questionId === question.questionId)?.answer || ""}
                />
              </div>
            ))}
          </div>
          
          <div className="px-6 py-4">
            <Button onClick={storeForm} className="w-full">
              Submit Response
            </Button>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => hideToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </>
  );
};

export default Form;
