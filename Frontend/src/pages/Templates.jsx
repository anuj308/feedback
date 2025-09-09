import React from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateGallery from '../components/TemplateGallery';
import { HomeNavbar } from '../components/index';
import { usePageTitle } from '../hooks/usePageTitle';

const Templates = () => {
  const navigate = useNavigate();
  
  // Set page title
  usePageTitle("Templates - Feedback Form Builder");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Use the same navbar as home page */}
      <HomeNavbar />
      
      {/* Templates Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <TemplateGallery 
          isHomePage={false}
          showCategories={true}
          showHeader={true}
        />
      </div>
    </div>
  );
};

export default Templates;
