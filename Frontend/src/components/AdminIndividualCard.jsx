import React, { useState } from "react";
import DataAdminCard from "./DataAdminCard";

const AdminIndividualCard = ({ s, name, setStoreForm }) => {
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
              {details.answers.map((answer, index) => (
                <div key={answer.questionId || index} className="border-l-4 border-blue-200 pl-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Question: {answer.question || `Question ${index + 1}`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Answer: {Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer || 'No answer'}
                  </p>
                </div>
              ))}
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
