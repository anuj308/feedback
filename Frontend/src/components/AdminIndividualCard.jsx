import React, { useState } from "react";
import DataAdminCard from "./DataAdminCard";

const AdminIndividualCard = ({ s, name, setStoreForm, form }) => {
  const [details, setDetails] = useState(s);
  const [showData, setShowData] = useState(false);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleShowData = () => {
    setShowData(!showData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-4">
      {/* Response Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {name ? name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {name || 'Anonymous User'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Submitted on {formatDate(details.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={toggleShowData}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            {showData ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      {/* Response Content */}
      {showData && (
        <div className="p-4">
          {details.answers && details.answers.length > 0 ? (
            <div className="space-y-4">
              {details.answers.map((answer, index) => {
                // Extract the actual answer value from Mongoose document
                let actualAnswer;
                let questionText;
                let questionType;
                
                if (answer._doc) {
                  // Mongoose document - use _doc property
                  actualAnswer = answer._doc.answer;
                  questionText = answer._doc.question || answer.question || `Question ${index + 1}`;
                  questionType = answer._doc.questionType || answer.questionType;
                } else if (answer.toObject && typeof answer.toObject === 'function') {
                  // Mongoose document with toObject method
                  const plainAnswer = answer.toObject();
                  actualAnswer = plainAnswer.answer;
                  questionText = plainAnswer.question || `Question ${index + 1}`;
                  questionType = plainAnswer.questionType;
                } else {
                  // Plain object
                  actualAnswer = answer.answer;
                  questionText = answer.question || `Question ${index + 1}`;
                  questionType = answer.questionType;
                }
                
                // Get the question data from form
                const questionData = form?.questions?.find(q => q.questionId === (answer.questionId || answer._doc?.questionId));
                
                // Handle different answer formats
                let displayAnswer = 'No answer';
                
                // Check if answer has actual content - be more lenient with falsy checks
                if (actualAnswer !== undefined && actualAnswer !== null) {
                  // Handle empty string case specifically
                  if (actualAnswer === '') {
                    displayAnswer = 'Empty response';
                  } else if (Array.isArray(actualAnswer)) {
                    if (actualAnswer.length > 0) {
                      displayAnswer = actualAnswer;
                    } else {
                      displayAnswer = [];
                    }
                  } else if (typeof actualAnswer === 'string') {
                    try {
                      // Try to parse if it's a JSON string (for checkboxes)
                      const parsed = JSON.parse(actualAnswer);
                      if (Array.isArray(parsed)) {
                        displayAnswer = parsed.length > 0 ? parsed : [];
                      } else {
                        displayAnswer = actualAnswer;
                      }
                    } catch {
                      // Not JSON, use as is
                      displayAnswer = actualAnswer;
                    }
                  } else if (typeof actualAnswer === 'number') {
                    displayAnswer = String(actualAnswer);
                  } else if (typeof actualAnswer === 'object') {
                    // Handle object answers (like file uploads)
                    if (actualAnswer.url) {
                      displayAnswer = `File: ${actualAnswer.fileName || 'uploaded file'}`;
                    } else {
                      displayAnswer = JSON.stringify(actualAnswer);
                    }
                  } else {
                    displayAnswer = String(actualAnswer);
                  }
                }
                
                // Render different question types like Google Forms
                const renderAnswer = () => {
                  if (questionType === 'multipleChoice' || questionType === 'dropdown') {
                    // Show all options with the selected one highlighted
                    const options = questionData?.options || [];
                    const selectedOption = Array.isArray(displayAnswer) ? displayAnswer[0] : displayAnswer;
                    
                    return (
                      <div className="space-y-1">
                        {options.map((option, optIndex) => (
                          <div key={optIndex} className={`flex items-center space-x-2 p-1 rounded ${
                            selectedOption === option ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}>
                            <div className={`w-3 h-3 rounded-full border-2 ${
                              selectedOption === option 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`} />
                            <span className={`text-sm ${
                              selectedOption === option 
                                ? 'text-blue-700 dark:text-blue-300 font-medium' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  } else if (questionType === 'checkbox') {
                    // Show all options with selected ones checked
                    const options = questionData?.options || [];
                    const selectedOptions = Array.isArray(displayAnswer) ? displayAnswer : [];
                    
                    return (
                      <div className="space-y-1">
                        {options.map((option, optIndex) => (
                          <div key={optIndex} className={`flex items-center space-x-2 p-1 rounded ${
                            selectedOptions.includes(option) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}>
                            <div className={`w-3 h-3 border-2 rounded ${
                              selectedOptions.includes(option)
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {selectedOptions.includes(option) && (
                                <svg className="w-2 h-2 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm ${
                              selectedOptions.includes(option)
                                ? 'text-blue-700 dark:text-blue-300 font-medium' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    // For text-based questions, show the answer as is
                    if (displayAnswer === 'No answer' || displayAnswer === 'Empty response') {
                      return <span className="text-gray-400 italic">{displayAnswer}</span>;
                    }
                    return (
                      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm whitespace-pre-wrap">
                        {displayAnswer}
                      </div>
                    );
                  }
                };
                
                return (
                  <div key={answer.questionId || index} className="border-l-4 border-blue-200 pl-4 pb-4">
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {questionText}
                      </h4>
                      {questionType && (
                        <span className="text-xs text-gray-400 uppercase">
                          {questionType}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      {renderAnswer()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No response data available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminIndividualCard;
