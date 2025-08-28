import React, { useState, useEffect, useContext, useCallback } from "react";
import { Button, FormHead, InputCard } from "../components/index";
import { useForms } from "../Context/StoreContext";
import { useNavigate, useParams, useLoaderData } from "react-router-dom";
import { api, endpoints } from "../utils/api";
import Admin from "./Admin";

const CreateForm = () => {
  const navigate = useNavigate();
  const { fId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [headData, setHeadData] = useState({});

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

  const addQuestion = useCallback((info) => {
    const newQuestion = { ...createNewQuestion(), ...info };
    setQuestions((prev) => [...prev, newQuestion]);
  }, []);

  const updateQuestion = useCallback((questionId, info) => {
    setQuestions((prev) => 
      prev.map((question) => 
        question.questionId === questionId ? { ...question, ...info } : question
      )
    );
  }, []);

  const deleteQuestion = useCallback((questionId) => {
    setQuestions((prev) => prev.filter((question) => question.questionId !== questionId));
  }, []);

  const setHead = (info) => {
    setHeadData(info);
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
      localStorage.removeItem("questions");
      setHead({
        formTitle: "Untitled Form",
        formDescription: "No Description",
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
        
        localStorage.setItem("questions", JSON.stringify(form.questions || []));
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
            <Button onClick={() => updateForm()} className="flex">
              Done
            </Button>
          </div>
        ) : (
          <Admin formId={fId} />
        )
      }
    </div>
  );
};

export default CreateForm;
