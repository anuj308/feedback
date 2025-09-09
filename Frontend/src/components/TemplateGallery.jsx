import React, { useState, useCallback } from 'react';
import TemplateCard from './TemplateCard';
import { formTemplates, templateCategories } from '../data/templates';
import { api, endpoints } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useForms } from '../Context/StoreContext';

const TemplateGallery = ({ 
  isHomePage = false, 
  maxVisible = 3, // Reduced from 6 to 3 for one row
  showCategories = true,
  showHeader = true 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, setHead } = useForms();

  // Filter templates based on selected category
  const filteredTemplates = selectedCategory === 'all' 
    ? formTemplates 
    : formTemplates.filter(template => template.category === selectedCategory);

  // Limit templates for home page display
  const displayTemplates = isHomePage 
    ? filteredTemplates.slice(0, maxVisible)
    : filteredTemplates;

  const handleUseTemplate = useCallback(async (template) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsCreating(true);
    try {
      console.log("🔄 Creating form from template:", template.title);
      
      // Step 1: Create an empty form with title and description
      const createFormData = {
        formTitle: template.title,
        formDescription: template.description,
        questions: [] // Start with empty questions
      };

      console.log("📝 Step 1: Creating empty form...");
      const createResponse = await api.post(endpoints.forms.create, createFormData);
      console.log("✅ Empty form created:", createResponse.data);
      
      const formId = createResponse.data.data.form._id;
      
      // Step 2: Update the form with template questions
      const templateQuestions = template.questions.map((question, index) => {
        const uniqueId = `q_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        return {
          questionId: uniqueId,
          type: question.type,
          question: question.question,
          description: question.description || "",
          titlePlaceholder: question.titlePlaceholder || "Question",
          descriptionPlaceholder: question.descriptionPlaceholder || "Description",
          required: question.required || false,
          options: Array.isArray(question.options) ? question.options : []
        };
      });

      const updateFormData = {
        formTitle: template.title,
        formDescription: template.description,
        questions: templateQuestions
      };

      console.log("📝 Step 2: Updating form with template questions...", updateFormData);
      const updateResponse = await api.post(endpoints.forms.update(formId), updateFormData);
      console.log("✅ Form updated with template questions:", updateResponse.data);
      
      // Step 3: Update context if needed
      if (setHead) {
        setHead({
          formTitle: template.title,
          formDescription: template.description,
        });
      }
      
      // Step 4: Navigate to the form editor
      navigate(`/create/${formId}`);
    } catch (error) {
      console.error("❌ Failed to create form from template:", error);
      console.error("Error details:", error.response?.data || error.message);
      // You could add a toast notification here
    } finally {
      setIsCreating(false);
    }
  }, [isAuthenticated, navigate, setHead]);

  return (
    <div className="w-full">
      {/* Header */}
      {showHeader && (
        <div className={`${isHomePage ? 'mb-4' : 'mb-6'}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className={`font-bold text-gray-900 dark:text-white ${
                isHomePage ? 'text-xl' : 'text-2xl'
              }`}>
                {isHomePage ? 'Quick Start Templates' : 'Form Templates'}
              </h2>
              {!isHomePage && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Browse our collection of pre-designed form templates
                </p>
              )}
              {isHomePage && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Click any template to get started
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      {showCategories && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {templateCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className={`grid gap-3 ${
        isHomePage 
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' // 6 columns for home page
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {displayTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUseTemplate={handleUseTemplate}
            className={isCreating ? 'opacity-50 pointer-events-none' : ''}
            isCompact={isHomePage}
          />
        ))}
      </div>

      {/* Loading State */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-4 max-w-md">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-gray-900 dark:text-white">
              <div className="font-medium">Creating form from template...</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">This may take a moment</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {displayTemplates.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No templates match the selected category.
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
