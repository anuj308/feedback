import React from "react";
import { useNavigate } from "react-router-dom";

const HomeCard = ({ fon, del, rename, id, cleanfun }) => {
  const navigate = useNavigate();

  const navigateToCreateForm = () => {
    navigate("/create/" + id);
  };

  return (
    <div className="m-3 max-w-sm rounded-xl overflow-hidden shadow-sm hover:shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-[1.02]">
      {/* Main Content - Clickable */}
      <div 
        className="px-6 py-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" 
        onClick={navigateToCreateForm}
      >
        {/* Form Icon */}
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        {/* Form Title */}
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">
          {fon.formTitle || "Untitled Form"}
        </h3>
        
        {/* Question Count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {fon.questions?.length || 0} questions
        </p>
      </div>
      
      {/* Actions */}
      <div className="px-6 pb-4 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            rename(fon._id, !fon.formTitle ? "Untitled Form" : fon.formTitle);
          }}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          Rename
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            del(fon._id);
          }}
          className="flex-1 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default HomeCard;
