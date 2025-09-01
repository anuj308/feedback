import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, endpoints } from "../utils/api";
import { FormHead, Button, FormCard, Toast } from "../components/index";
import { useToast } from "../hooks/useToast";

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
      // Check if sign in is required
      if (formSettings.requireSignIn) {
        // Check if user is logged in
        try {
          await api.get(endpoints.user.currentUser);
        } catch (error) {
          if (error.response?.status === 401) {
            showErrorToast("You need to sign in to submit this form");
            setTimeout(() => navigate("/login"), 1500);
            return;
          }
        }
      }
      
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

      const response = await api.post(endpoints.store.submit, {
        formId: fId,
        answers: answers,
        email: formSettings.collectEmail ? userEmail : undefined,
      });
      
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
      } else if (error.response?.status === 401 && formSettings.requireSignIn) {
        showErrorToast("You need to sign in to submit this form");
        setTimeout(() => navigate("/login"), 1500);
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
        const response = await api.get(endpoints.forms.getById(fId));
        const form = response.data.data.form;
        
        console.log("📄 Form loaded for submission:", { 
          title: form.formTitle, 
          questionsCount: form.questions?.length || 0,
          settings: form.settings 
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
          
          setQuestions(questionsToSet);
        } else {
          console.warn("⚠️ No questions found in form");
        }
        
        // Check if form is accepting responses
        if (form.acceptingResponses === false) {
          showErrorToast("This form is no longer accepting responses");
          setTimeout(() => navigate("/"), 1500);
          return;
        }
        
        // Check access control and collect email if needed
        if (form.settings?.allowedEmails && form.settings.allowedEmails.length > 0) {
          try {
            const userResponse = await api.get(endpoints.user.currentUser);
            const email = userResponse.data.data.user.email;
            setUserEmail(email);
            
            if (!form.settings.allowedEmails.includes(email)) {
              showErrorToast("You are not authorized to access this form");
              setTimeout(() => navigate("/"), 1500);
              return;
            }
          } catch (error) {
            if (error.response?.status === 401) {
              showErrorToast("You need to sign in to access this form");
              setTimeout(() => navigate("/login"), 1500);
              return;
            }
          }
        } else if (form.settings?.collectEmail) {
          // Try to get user email for collection
          try {
            const userResponse = await api.get(endpoints.user.currentUser);
            setUserEmail(userResponse.data.data.user.email);
          } catch (error) {
            // User not logged in, but email collection is required
            if (form.settings?.requireSignIn) {
              showErrorToast("You need to sign in to submit this form");
              setTimeout(() => navigate("/login"), 1500);
              return;
            }
          }
        }
        
      } catch (error) {
        console.error("Error while fetching form", error);
        if (error.response?.status === 404) {
          showErrorToast("Form not found");
          setTimeout(() => navigate("/"), 1500);
        } else {
          showErrorToast("Error loading form. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    func();
  }, [fId, navigate]);

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

  if (loading) {
    return (
      <div className="mx-auto md:w-1/2 mt-14 rounded overflow-hidden shadow-lg p-8">
        <div className="text-center">Loading form...</div>
      </div>
    );
  }

  return (
    <>
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
