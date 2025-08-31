import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Settings from "./pages/Settings";
import Navabar from "./components/Navabar";
import Footer from "./components/Footer";
import CreateForm from "./pages/CreateForm";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { FormProvider } from "./Context/StoreContext";
import Form from "./pages/Form";
import Admin from "./pages/Admin";
import { api, endpoints } from "./utils/api";

// Component to conditionally render Navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/settings', '/login', '/signup'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname) || 
                          location.pathname.startsWith('/create/') ||
                          location.pathname.startsWith('/admin/') ||
                          location.pathname.startsWith('/form/');
  
  return !shouldHideNavbar ? <Navabar /> : null;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const authCheckRef = useRef(false);

  // Check authentication status on app load (only once)
  useEffect(() => {
    if (!authCheckRef.current) {
      authCheckRef.current = true;
      checkAuthStatus();
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
          console.log("✅ User authenticated");
        }
        
        setIsAuthenticated(true);
        setUserData(response.data.data);
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
  }, []);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider
      value={{
        isAuthenticated,
        userData,
        user: userData, // Alias for compatibility
        forms: [], // This can be implemented if needed
        setUser,
        updateUser,
        setIsAuthenticated,
        setUserData,
        logout,
        checkAuthStatus,
        resetAppState,
        isLoading,
        setIsLoading,
      }}
    >
      <BrowserRouter>
        <ConditionalNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create/:fId" element={<CreateForm />}/>
          <Route path="/admin/:fId" element={<Admin />}/>
          <Route path="/form/:fId" element={<Form />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </FormProvider>
  );
}

export default App;
