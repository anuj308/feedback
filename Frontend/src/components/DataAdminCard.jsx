import React, { useEffect } from "react";
import { Input, MultipeChoice, Select, CheckBox } from "./index.js";

const DataAdminCard = ({
  card,
  id,
  question,
  description,
  option,
  updateCard,
  multipleChoice,
  checkBoxes,
}) => {
  useEffect(() => {
    console.log(card);
  }, []);

  const renderAnswer = () => {
    const answer = card.data.answer;
    
    if (!answer) {
      return <span className="text-gray-400 italic">No answer provided</span>;
    }
    
    if (Array.isArray(answer)) {
      return (
        <div className="space-y-1">
          {answer.map((item, index) => (
            <span key={index} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded mr-1 mb-1">
              {item}
            </span>
          ))}
        </div>
      );
    }
    
    return <span className="text-gray-900 dark:text-white">{answer}</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4">
      {/* Question */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Question:
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          {card.data.question}
        </p>
      </div>

      {/* Description if available */}
      {card.data.description && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description:
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            {card.data.description}
          </p>
        </div>
      )}

      {/* Answer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Answer:
        </label>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md min-h-[40px] flex items-center">
          {renderAnswer()}
        </div>
      </div>
    </div>
  );
};

export default DataAdminCard;
