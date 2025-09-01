import React, { useEffect, useRef } from 'react';
import { api, endpoints } from '../utils/api';
import { useForms } from '../Context/StoreContext';

const GoogleSignInButton = ({ onSuccess, onError, text = "Sign in with Google" }) => {
  const buttonRef = useRef(null);
  const { setIsAuthenticated, setUserData } = useForms();

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // You'll need to add this to your .env file
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 350, // Fixed width instead of percentage
          text: text === "Sign in with Google" ? 'signin_with' : 'signup_with',
          shape: 'rectangular',
        });
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [text]);

  const handleCredentialResponse = async (response) => {
    try {
      console.log('Google credential response received');
      
      // Send the credential to your backend
      const result = await api.post(endpoints.auth.googleAuth, {
        credential: response.credential
      });

      console.log('Backend response successful');

      if (result.data.data) {
        setIsAuthenticated(true);
        setUserData(result.data.data);
        onSuccess && onSuccess(result.data.data);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      // Production-friendly error messages
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = 'Invalid authentication. Please try again.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many attempts. Please wait and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      onError && onError(new Error(errorMessage));
    }
  };

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full"></div>
    </div>
  );
};

export default GoogleSignInButton;
