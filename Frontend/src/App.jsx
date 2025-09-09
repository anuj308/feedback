import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import Navabar from "./components/Navabar";
import Footer from "./components/Footer";
import CreateForm from "./pages/CreateForm";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { FormProvider } from "./Context/StoreContext";
import Form from "./pages/Form";
import Admin from "./pages/Admin";
import { api, endpoints } from "./utils/api";
import { useRouteTitle } from "./hooks/usePageTitle";

// Component to conditionally render Navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/templates', '/settings', '/login', '/signup'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname) || 
                          location.pathname.startsWith('/create/') ||
                          location.pathname.startsWith('/admin/') ||
                          location.pathname.startsWith('/form/');
  
  return !shouldHideNavbar ? <Navabar /> : null;
};

// Component to handle route-based title updates
const TitleManager = () => {
  useRouteTitle();
  return null;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [currentTheme, setCurrentTheme] = useState('light');
  const authCheckRef = useRef(false);

  // Apply theme to DOM
  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else { // auto
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    setCurrentTheme(theme);
  }, []);

  // Load theme from user settings when user data changes
  useEffect(() => {
    if (userData?.settings?.theme) {
      applyTheme(userData.settings.theme);
    }
  }, [userData?.settings?.theme, applyTheme]);

  // Check authentication status on app load (only once)
  useEffect(() => {
    if (!authCheckRef.current) {
      authCheckRef.current = true;
      
      // Check for OAuth return
      const urlParams = new URLSearchParams(window.location.search);
      const authStatus = urlParams.get('auth');
      const authError = urlParams.get('error');
      
      if (authStatus === 'success') {
        console.log('✅ OAuth authentication successful');
        // Clean URL first
        window.history.replaceState({}, document.title, window.location.pathname);
        // Force a fresh auth check to update user data
        checkAuthStatus().then(() => {
          console.log('🔄 User data refreshed after OAuth success');
        });
      } else if (authError) {
        console.log('❌ OAuth authentication failed:', authError);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        checkAuthStatus();
      } else {
        checkAuthStatus();
      }
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (import.meta.env.VITE_DEBUG_API !== 'true') {
      console.log("🔍 Checking authentication status...");
    }
    setIsLoading(true);
    
    try {
      // Call your auth check API endpoint
      const response = await api.get(endpoints.auth.currentUser);
      
      // Check for success (handle both 'Success' and 'success' properties)
      const isSuccess = response.data.Success || response.data.success || response.status === 200;
      
      if (isSuccess && response.data.data) {
        if (import.meta.env.VITE_DEBUG_API !== 'true') {
          console.log("✅ User authenticated", response.data.data);
        }
        
        setIsAuthenticated(true);
        setUserData(response.data.data);
        
        // Force theme application if user has theme settings
        if (response.data.data.settings?.theme) {
          setTimeout(() => {
            applyTheme(response.data.data.settings.theme);
          }, 0);
        }
      } else {
        console.log("❌ User not authenticated - invalid response format");
        handleAuthFailure();
      }
    } catch (error) {
      // Handle different error scenarios
      if (error.response?.status === 401) {
        if (import.meta.env.VITE_DEBUG_API !== 'true') {
          console.log("🚪 No valid authentication - user needs to login");
        }
      } else if (error.response?.status) {
        console.log("❌ Auth check failed with status:", error.response.status);
      } else {
        console.log("❌ Auth check failed - network or server issue:", error.message);
      }
      handleAuthFailure();
    } finally {
      setIsLoading(false);
    }
  }, [applyTheme]);

  const handleAuthFailure = useCallback(() => {
    if (import.meta.env.VITE_DEBUG_API !== 'true') {
      console.log("🧹 Clearing authentication data...");
    }
    
    // Clear authentication state
    setIsAuthenticated(false);
    setUserData({});
  }, []);

  const logout = useCallback(async () => {
    if (import.meta.env.VITE_DEBUG_API !== 'true') {
      console.log("🚪 Logging out user...");
    }
    try {
      await api.post(endpoints.auth.logout);
    } catch (error) {
      console.error("❌ Logout API error:", error);
    } finally {
      // Clear stored tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Always clear data regardless of API success/failure
      handleAuthFailure();
    }
  }, [handleAuthFailure]);

  // Function to reset all application state (for logout)
  const resetAppState = () => {
    console.log("🔄 Resetting application state...");
    // This can be called by components to reset their local state
    // Components should listen to isAuthenticated changes and reset themselves
  };

  const updateUser = useCallback((updatedUser) => {
    setUserData(updatedUser);
  }, []);

  const setUser = useCallback((user) => {
    if (import.meta.env.VITE_DEBUG_API !== 'true') {
      console.log("👤 Updating user data");
    }
    setUserData(data);
  }, []);

  // Initialize API instance
  useEffect(() => {
    if (import.meta.env.VITE_DEBUG_API === 'true') {
      console.log("🚀 App initialized with API configuration");
      console.log("🔧 Environment:", {
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
        nodeEnv: import.meta.env.VITE_NODE_ENV,
        debugApi: import.meta.env.VITE_DEBUG_API,
      });
    }
  }, []);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <FormProvider
        value={{
          isAuthenticated,
          userData,
          user: userData, // Alias for compatibility
          forms: [], // This can be implemented if needed
          currentTheme,
          setUser,
          updateUser,
          setIsAuthenticated,
          setUserData,
          logout,
          checkAuthStatus,
          resetAppState,
          applyTheme,
          isLoading,
          setIsLoading,
        }}
      >
        <BrowserRouter>
          <TitleManager />
          <ConditionalNavbar />
          <div className="w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/create/:fId" element={<CreateForm />}/>
              <Route path="/admin/:fId" element={<Admin />}/>
              <Route path="/form/:fId" element={<Form />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
          <Footer />
        </BrowserRouter>
      </FormProvider>
    </div>
  );
}

export default App;
