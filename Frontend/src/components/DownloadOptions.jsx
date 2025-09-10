import React from 'react';
import { downloadUtils } from '../utils/downloadUtils';

const DownloadOptions = ({ 
  type, // 'summary', 'questions', 'individual'
  data, 
  formTitle,
  form = null,
  className = ""
}) => {
  const handleDownload = async (format) => {
    try {
      switch (type) {
        case 'summary':
          if (format === 'pdf') {
            await downloadUtils.downloadSummaryPDF(data, formTitle);
          } else {
            downloadUtils.downloadSummaryCSV(data, formTitle);
          }
          break;
          
        case 'questions':
          if (format === 'pdf') {
            await downloadUtils.downloadQuestionAnalysisPDF(data, formTitle);
          } else {
            downloadUtils.downloadQuestionAnalysisCSV(data, formTitle);
          }
          break;
          
        case 'individual':
          if (format === 'pdf') {
            downloadUtils.downloadIndividualResponsesPDF(data, formTitle, form);
          } else {
            downloadUtils.downloadIndividualResponsesCSV(data, formTitle, form);
          }
          break;
          
        default:
          console.error('Invalid download type:', type);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={() => handleDownload('pdf')}
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        title="Download as PDF"
      >
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        PDF
      </button>
      
      <button
        onClick={() => handleDownload('csv')}
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        title="Download as CSV"
      >
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        CSV
      </button>
    </div>
  );
};

export default DownloadOptions;
