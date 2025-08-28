import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, endpoints } from "../utils/api";
import { FormHead, Button, FormCard } from "../components/index";

const Form = () => {
  const { fId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSettings, setFormSettings] = useState({});
  const [loading, setLoading] = useState(true);

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
    console.log("📝 Submitting form response:", { 
      formId: fId, 
      answersCount: answers.length,
      answers: answers 
    });
    
    try {
      // Validate required questions
      const requiredQuestions = questions.filter(q => q.required);
      const answeredQuestions = answers.map(a => a.questionId);
      
      const missingRequired = requiredQuestions.filter(q => 
        !answeredQuestions.includes(q.questionId)
      );
      
      if (missingRequired.length > 0) {
        console.warn("❌ Missing required answers:", missingRequired.map(q => q.question));
        alert("Please answer all required questions");
        return;
      }

      const response = await api.post(endpoints.store.submit, {
        formId: fId,
        answers: answers,
      });
      
      console.log("✅ Form response submitted successfully");
      
      // Show success message based on form settings
      const message = formSettings.confirmationMessage || "Thank you for your response!";
      alert(message);
      
      navigate("/");
    } catch (error) {
      console.error("❌ Error while sending data to server:", error);
      
      if (error.response?.status === 400) {
        alert(error.response.data.message || "Error submitting response");
      } else if (error.response?.status === 401) {
        alert("You need to sign in to submit this form");
        navigate("/login");
      } else {
        alert("Error submitting response. Please try again.");
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
          setQuestions(form.questions);
        }
        
        // Check if form is accepting responses
        if (!form.acceptingResponses) {
          alert("This form is no longer accepting responses");
          navigate("/");
        }
        
      } catch (error) {
        console.error("Error while fetching form", error);
        if (error.response?.status === 404) {
          alert("Form not found");
          navigate("/");
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
    <div className="mx-auto md:w-1/2 mt-14 rounded overflow-hidden shadow-lg">
      <FormHead 
        headData={{ formTitle, formDescription }} 
        readOnly={true}
      />
      
      {formSettings.showProgressBar && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mx-6 my-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(answers.length / questions.length) * 100}%` }}
          ></div>
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
  );
};

export default Form;
