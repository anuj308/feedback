import React from 'react';

const AnalyticsSummaryCard = ({ analytics, responses }) => {
  if (!analytics || !analytics.questionAnalytics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Response Summary
        </h3>
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const { questionAnalytics, totalResponses } = analytics;

  // Helper function to calculate percentage
  const calculatePercentage = (count, total) => {
    return total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  };

  // Helper function to get unique answers for text-based questions
  const getUniqueTextAnswers = (responses, questionId) => {
    const answers = [];
    responses.forEach(response => {
      const answer = response.answers?.find(a => a.questionId === questionId);
      if (answer && answer.answer && answer.answer.trim() !== '') {
        // Extract actual answer from Mongoose document
        let actualAnswer;
        if (answer._doc) {
          actualAnswer = answer._doc.answer;
        } else if (answer.toObject && typeof answer.toObject === 'function') {
          actualAnswer = answer.toObject().answer;
        } else {
          actualAnswer = answer.answer;
        }
        
        if (actualAnswer && actualAnswer.trim() !== '') {
          answers.push(actualAnswer.trim());
        }
      }
    });
    return [...new Set(answers)]; // Remove duplicates
  };

  // Helper function to render bar chart
  const renderBarChart = (data, total) => {
    const maxCount = Math.max(...data.map(item => item.count));
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = calculatePercentage(item.count, total);
          const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-24 text-sm text-gray-600 dark:text-gray-400 truncate">
                {item.option}
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
                  <div 
                    className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                  <span className="absolute left-2 inset-y-0 flex items-center text-xs font-medium text-white">
                    {percentage}%
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                  {item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to render text answers summary
  const renderTextAnswersSummary = (questionId, questionText, questionType) => {
    const uniqueAnswers = getUniqueTextAnswers(responses, questionId);
    const answeredCount = uniqueAnswers.length;
    
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {answeredCount} unique {answeredCount === 1 ? 'response' : 'responses'}
        </div>
        {uniqueAnswers.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {uniqueAnswers.slice(0, 5).map((answer, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm">
                "{answer}"
              </div>
            ))}
            {uniqueAnswers.length > 5 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                And {uniqueAnswers.length - 5} more responses...
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          📊 Response Summary
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {totalResponses} {totalResponses === 1 ? 'response' : 'responses'} collected
        </p>
      </div>

      {/* Email Collection Summary */}
      {responses && responses.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            📧 Who has responded?
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="space-y-2">
              {responses.slice(0, 10).map((response, index) => {
                const email = response.email || response.respondentEmail || 'Anonymous';
                const name = response.respondentName || 'Anonymous User';
                return (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 dark:text-white">{name}</span>
                    <span className="text-gray-600 dark:text-gray-400">{email}</span>
                  </div>
                );
              })}
              {responses.length > 10 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                  And {responses.length - 10} more responses...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question Analytics */}
      <div className="space-y-8">
        {questionAnalytics.map((question, index) => {
          const isChoiceType = ['multipleChoice', 'checkbox', 'dropdown'].includes(question.type);
          const isTextType = ['shortAnswer', 'paragraph'].includes(question.type);
          
          return (
            <div key={question.questionId} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-1">
                  {question.question}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {question.responseCount} {question.responseCount === 1 ? 'response' : 'responses'}
                </p>
              </div>

              {isChoiceType && question.optionBreakdown && (
                <div>
                  {renderBarChart(question.optionBreakdown, question.responseCount)}
                </div>
              )}

              {isTextType && (
                <div>
                  {renderTextAnswersSummary(question.questionId, question.question, question.type)}
                </div>
              )}

              {question.type === 'fileUpload' && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {question.responseCount} {question.responseCount === 1 ? 'file' : 'files'} uploaded
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsSummaryCard;
