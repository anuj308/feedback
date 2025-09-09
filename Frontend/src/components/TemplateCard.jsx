import React from 'react';

const TemplateCard = ({ template, onUseTemplate, className = "", isCompact = false }) => {
  return (
    <div 
      onClick={() => onUseTemplate(template)}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600 ${className}`}
    >
      {/* Template Icon and Color */}
      <div className={`${template.color} ${isCompact ? 'h-16' : 'h-20'} flex items-center justify-center relative`}>
        <span className={`${isCompact ? 'text-2xl' : 'text-3xl'}`}>{template.icon}</span>
        {/* Hover indicator */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </div>
      
      {/* Template Content */}
      <div className={`${isCompact ? 'p-3' : 'p-4'}`}>
        <h3 className={`font-semibold text-gray-900 dark:text-white text-center ${
          isCompact ? 'text-sm leading-tight' : 'text-lg'
        }`}>
          {template.title}
        </h3>
        
        {!isCompact && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 text-center">
            {template.description}
          </p>
        )}
        
        {/* Template Stats - centered */}
        <div className={`flex justify-center text-xs text-gray-500 dark:text-gray-400 ${
          isCompact ? 'mt-2' : 'mt-3'
        }`}>
          <span>{template.questions.length} questions</span>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
