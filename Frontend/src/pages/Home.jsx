import React, { useEffect, useState, useCallback, useRef } from "react";
import { HomeCard, RenameCard, HomeNavbar } from "../components/index.js";
import { api, endpoints } from "../utils/api";
import { useForms } from "../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

const Home = () => {
  const [allForms, setAllForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formsLoading, setFormsLoading] = useState(false);
  const navigate = useNavigate();
  const fetchRef = useRef(false);
  const {
    isAuthenticated,
    userData, 
    setHead,
    isLoading,
    setIsLoading,
  } = useForms();

  // Set page title
  usePageTitle("Dashboard - Feedback Form Builder");
  const [showRename, setShowRename] = useState(false);

  // Handle search functionality
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredForms(allForms);
    } else {
      const filtered = allForms.filter(form =>
        form.title?.toLowerCase().includes(query.toLowerCase()) ||
        form.description?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredForms(filtered);
    }
  }, [allForms]);

  // Update filtered forms when allForms changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredForms(allForms);
    } else {
      handleSearch(searchQuery);
    }
  }, [allForms, searchQuery, handleSearch]);

  const deleteForm = useCallback(async (id) => {
    if (import.meta.env.VITE_DEBUG_API !== 'true') {
      console.log("🗑️ Deleting form:", id);
    }
    setFormsLoading(true);
    try {
      const response = await api.delete(endpoints.forms.delete(id));
      
      // Refresh forms list
      if (isAuthenticated) {
        const formsResponse = await api.get(endpoints.forms.getByOwner());
        setAllForms(formsResponse.data.data.form);
      }
    } catch (error) {
      console.error("❌ Error deleting form:", error);
    } finally {
      setFormsLoading(false);
    }
  }, [isAuthenticated]);

  const toCreate = useCallback(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/create");
    }
  }, [isAuthenticated, navigate]);
  // for rename of form
  const [formTitle, setFormTitle] = useState("");
  const [formRenameId, setFormRenameId] = useState("");
  const onChangeHandlerRename = useCallback((event) => {
    const value = event.target.value;
    setFormTitle(value);
  }, []);

  const renameForm = useCallback((id, title) => {
    setFormTitle(title.length === 0 ? "Untitled Form" : title);
    setFormRenameId(id);
    setShowRename(true);
  }, []);

  const cleanfun = useCallback(() => {
    setHead({
      formTitle: "Untitled Form",
      formDescription: "",
    });
  }, [setHead]);

  useEffect(() => {
    const fetchForms = async () => {
      if (!isAuthenticated) {
        setAllForms([]);
        fetchRef.current = false;
        return;
      }
      
      // Prevent duplicate fetches
      if (fetchRef.current) return;
      fetchRef.current = true;
      
      setFormsLoading(true);
      try {
        if (import.meta.env.VITE_DEBUG_API !== 'true') {
          console.log("📋 Fetching forms for authenticated user");
        }
        const response = await api.get(endpoints.forms.getByOwner());
        if (import.meta.env.VITE_DEBUG_API !== 'true') {
          console.log("✅ Forms fetched successfully:", response.data.data.form.length);
        }
        setAllForms(response.data.data.form);
      } catch (error) {
        console.error("❌ Error while fetching forms:", error);
        setAllForms([]);
        fetchRef.current = false; // Reset on error
      } finally {
        setFormsLoading(false);
      }
    };
    
    fetchForms();
  }, [isAuthenticated]);
  return (
    <>
      {/* Home Navbar */}
      <HomeNavbar onSearch={handleSearch} />
      
      {showRename && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-50">
          <RenameCard
            cancel={setShowRename}
            cancelState={showRename}
            formTitle={formTitle}
            onChangeHandlerRename={onChangeHandlerRename}
            formRenameId={formRenameId}
            setAllForms={setAllForms}
            userData={userData}
            className="m-44 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-7 shadow-md"
          />
        </div>
      )}
      
      <div className="min-h-[80vh] mt-0 py-20 px-6 pt-8 pb-2 flex flex-row flex-wrap justify-center mx-auto w-full bg-gray-50 dark:bg-gray-900">
        {formsLoading ? (
          <div className="flex flex-col items-center justify-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading forms...</p>
          </div>
        ) : searchQuery && filteredForms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No forms found</h3>
            <p className="text-gray-500 dark:text-gray-400">No forms match your search for "{searchQuery}"</p>
          </div>
        ) : allForms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No forms yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first form to get started</p>
            <button
              onClick={() => toCreate()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Create Your First Form
            </button>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="w-full mb-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Found {filteredForms.length} form{filteredForms.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              </div>
            )}
            {filteredForms.map((fon, index) => {
              return (
                <div className="text-black dark:text-white text-xl" key={index}>
                  <HomeCard
                    fon={fon}
                    del={deleteForm}
                    rename={renameForm}
                    id={fon._id}
                    cleanfun={cleanfun}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
};

export default Home;
