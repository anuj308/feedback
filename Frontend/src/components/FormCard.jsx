import React, { useEffect, useState } from "react";
import { Input, MultipeChoice, Select, CheckBox } from "./index.js";

const FormCard = ({
  question,
  questionId,
  type,
  questionText,
  description,
  required,
  options,
  updateAnswer,
  currentAnswer,
}) => {
  const [answer, setAnswer] = useState(currentAnswer || "");
  const [selectedOptions, setSelectedOptions] = useState(() => {
    if (type === "checkbox" && currentAnswer) {
      try {
        return Array.isArray(currentAnswer) ? currentAnswer : JSON.parse(currentAnswer);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Debug logging
  useEffect(() => {
    console.log(`🎯 FormCard rendered for question ${questionId}:`, {
      type,
      questionText,
      currentAnswer,
      options: options?.length || 0
    });
  }, [questionId, type, questionText, currentAnswer, options]);

  useEffect(() => {
    setAnswer(currentAnswer || "");
    if (type === "checkbox" && currentAnswer) {
      try {
        const parsed = Array.isArray(currentAnswer) ? currentAnswer : JSON.parse(currentAnswer);
        setSelectedOptions(parsed);
      } catch {
        setSelectedOptions([]);
      }
    }
  }, [currentAnswer, type]);

  const onChangeHandler = (event) => {
    const value = event.target.value;
    setAnswer(value);
    updateAnswer(questionId, value);
  };

  const onCheckboxChange = (optionText, checked) => {
    let newSelectedOptions;
    if (checked) {
      newSelectedOptions = [...selectedOptions, optionText];
    } else {
      newSelectedOptions = selectedOptions.filter(opt => opt !== optionText);
    }
    setSelectedOptions(newSelectedOptions);
    updateAnswer(questionId, JSON.stringify(newSelectedOptions));
  };

  const onRadioChange = (optionText) => {
    setAnswer(optionText);
    updateAnswer(questionId, optionText);
  };

  return (
    <div className="mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl m-3 shadow-sm">
      <div className="flex flex-row bg-blue-50 dark:bg-blue-900/20 px-6 pt-4 rounded-t-2xl pb-2">
        <div className="w-full">
          <div className="mb-2 text-gray-900 dark:text-white text-lg font-medium">
            {questionText}
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
          
          {description && (
            <div className="mb-2 text-gray-600 dark:text-gray-400 text-sm">
              {description}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pt-4 pb-6">
        {type === "shortAnswer" && (
          <div>
            <Input
              type="text"
              placeholder="Your answer"
              name="answer"
              onChange={onChangeHandler}
              value={answer}
              required={required}
            />
          </div>
        )}
        
        {type === "paragraph" && (
          <textarea
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your answer"
            value={answer}
            onChange={onChangeHandler}
            rows={4}
            required={required}
          />
        )}
        
        {type === "multipleChoice" && (
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`${questionId}-${index}`}
                  name={questionId}
                  value={option}
                  checked={answer === option}
                  onChange={() => onRadioChange(option)}
                  className="mr-3 text-blue-600"
                  required={required}
                />
                <label htmlFor={`${questionId}-${index}`} className="text-gray-700 dark:text-gray-300">
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
        
        {type === "checkbox" && (
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${questionId}-${index}`}
                  value={option}
                  checked={selectedOptions.includes(option)}
                  onChange={(e) => onCheckboxChange(option, e.target.checked)}
                  className="mr-3 text-blue-600"
                />
                <label htmlFor={`${questionId}-${index}`} className="text-gray-700 dark:text-gray-300">
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
        
        {type === "dropdown" && (
          <select
            value={answer}
            onChange={onChangeHandler}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          >
            <option value="">Choose an option</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
        
        {type === "fileUpload" && (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setAnswer(file.name);
                updateAnswer(questionId, file.name);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          />
        )}
        
        {/* Fallback for any unmatched types - show as text input */}
        {!["shortAnswer", "paragraph", "multipleChoice", "checkbox", "dropdown", "fileUpload"].includes(type) && (
          <div className="border border-red-300 p-3 rounded bg-red-50">
            <p className="text-red-600 text-sm mb-2">Unknown question type: "{type}"</p>
            <Input
              type="text"
              placeholder="Your answer"
              name="answer"
              onChange={onChangeHandler}
              value={answer}
              required={required}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormCard;
