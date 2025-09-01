import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTitle = (title) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
};

export const useRouteTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const getRouteTitle = (pathname) => {
      const baseTitle = 'Feedback Form Builder';
      
      // Define route-specific titles
      const routeTitles = {
        '/': `Dashboard - ${baseTitle}`,
        '/login': `Sign In - ${baseTitle}`,
        '/signup': `Sign Up - ${baseTitle}`,
        '/settings': `Settings - ${baseTitle}`,
        '/create': `Create Form - ${baseTitle}`,
      };

      // Handle dynamic routes with better naming
      if (pathname.startsWith('/create/')) {
        const formId = pathname.split('/')[2];
        return formId === 'new' ? `Create New Form - ${baseTitle}` : `Edit Form - ${baseTitle}`;
      }
      
      if (pathname.startsWith('/form/')) {
        return `Form Response - ${baseTitle}`;
      }
      
      if (pathname.startsWith('/admin/')) {
        return `Admin Dashboard - ${baseTitle}`;
      }

      // Handle 404 or unknown routes
      if (!routeTitles[pathname] && pathname !== '/') {
        return `Page Not Found - ${baseTitle}`;
      }

      // Return specific title or default
      return routeTitles[pathname] || baseTitle;
    };

    const title = getRouteTitle(location.pathname);
    document.title = title;
    
    // Update meta description based on route
    const updateMetaDescription = (pathname) => {
      const descriptions = {
        '/': 'Create and manage feedback forms with ease. Build custom surveys, collect responses, and analyze data.',
        '/login': 'Sign in to your Feedback Form Builder account to access your forms and dashboard.',
        '/signup': 'Create a new account to start building custom feedback forms and surveys.',
        '/settings': 'Manage your account settings, preferences, and form configurations.',
      };
      
      const description = descriptions[pathname] || 'Professional feedback form builder for creating surveys, collecting responses, and analyzing data.';
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    };

    updateMetaDescription(location.pathname);
  }, [location.pathname]);
};

export default usePageTitle;
