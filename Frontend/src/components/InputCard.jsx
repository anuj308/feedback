import React, { useEffect, useState } from "react";
import { Input, Select } from "./index.js";

const InputCard = ({
  question,
  questionId,
  type,
  questionText,
  description,
  titlePlaceholder = "Question",
  descriptionPlaceholder = "Description",
  required = false,
  options = [],
  updateQuestion,
  deleteQuestion,
}) => {
  const [questionData, setQuestionData] = useState({
    question: questionText || "",
    description: description || "",
    type: type || "shortAnswer",
    required: required,
    options: options,
  });

  const questionTypes = [
    { option: "Short answer", optionValue: "shortAnswer" },
    { option: "Paragraph", optionValue: "paragraph" },
    { option: "Multiple choice", optionValue: "multipleChoice" },
    { option: "Checkboxes", optionValue: "checkbox" },
    { option: "Dropdown", optionValue: "dropdown" },
    { option: "File upload", optionValue: "fileUpload" },
  ];

  useEffect(() => {
    // Only call updateQuestion if updateQuestion function is available and data has changed
    if (updateQuestion && typeof updateQuestion === 'function') {
      updateQuestion(questionId, questionData);
    }
  }, [
    questionData.question, 
    questionData.description, 
    questionData.type, 
    questionData.required, 
    JSON.stringify(questionData.options),
    questionId
  ]); // Remove questionData object and updateQuestion from dependencies

  const onChangeHandler = (event) => {
    const { name, value, type: inputType, checked } = event.target;
    const newValue = inputType === "checkbox" ? checked : value;
    
    setQuestionData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const addOption = () => {
    setQuestionData(prev => ({
      ...prev,
      options: [...prev.options, "Option " + (prev.options.length + 1)]
    }));
  };

  const updateOption = (index, value) => {
    setQuestionData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const deleteOption = (index) => {
    setQuestionData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const needsOptions = ["multipleChoice", "checkbox", "dropdown"].includes(questionData.type);

  return (
    <div className="mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl m-3 shadow-sm">
      <div className="flex flex-row bg-gray-50 dark:bg-gray-900 px-6 pt-4 rounded-t-2xl pb-2">
        <div className="w-full">
          <Input
            type="text"
            className="mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 border border-gray-300 dark:border-gray-600 block w-full p-2.5"
            value={questionData.question}
            onChange={onChangeHandler}
            name="question"
            placeholder={titlePlaceholder}
          />

          <Input
            type="text"
            className="mb-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 border border-gray-300 dark:border-gray-600 block w-full p-2.5"
            value={questionData.description}
            onChange={onChangeHandler}
            name="description"
            placeholder={descriptionPlaceholder}
          />
        </div>
        
        <div className="ml-4 flex flex-col justify-between">
          <button
            onClick={() => deleteQuestion(questionId)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
            type="button"
          >
            ×
          </button>
        </div>
      </div>

      <div className="px-6 pt-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <Select
            options={questionTypes}
            value={questionData.type}
            onChange={onChangeHandler}
            name="type"
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="required"
              checked={questionData.required}
              onChange={onChangeHandler}
              className="mr-2 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Required</span>
          </label>
        </div>

        {needsOptions && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Options</h4>
              <button
                onClick={addOption}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                type="button"
              >
                + Add Option
              </button>
            </div>
            
            <div className="space-y-2">
              {questionData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    {questionData.type === "multipleChoice" ? "○" : "☐"}
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => deleteOption(index)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {questionData.type === "shortAnswer" && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <input
              type="text"
              placeholder="Short answer text"
              className="w-full border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-300 focus:outline-none focus:border-blue-500"
              disabled
            />
          </div>
        )}

        {questionData.type === "paragraph" && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <textarea
              placeholder="Long answer text"
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              disabled
            />
          </div>
        )}

        {questionData.type === "fileUpload" && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
              Click to upload or drag and drop
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputCard;
