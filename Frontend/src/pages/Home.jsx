import React, { useEffect, useState, useCallback, useRef } from "react";
import { HomeCard, RenameCard } from "../components/index.js";
import { api, endpoints } from "../utils/api";
import { useForms } from "../Context/StoreContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [allForms, setAllForms] = useState([]);
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
  const [showRename, setShowRename] = useState(false);

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
            className="m-44 border bg-white rounded-lg p-7 shadow-md"
          />
        </div>
      )}
      <div className=" min-h-[80vh] mt-16 my-20 px-6 pt-4 pb-2 flex flex-row flex-wrap justify-center mx-auto w-full">
        {formsLoading ? (
          <div className="flex flex-col items-center justify-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading forms...</p>
          </div>
        ) : allForms.length === 0 ? (
          <h1 className=" text-black text-3xl flex justify-center items-center h-80v ">
            No Form Exist -
            <span className="hover:text-blue-400" onClick={() => toCreate()}>
              Create now
            </span>
          </h1>
        ) : (
          allForms.map((fon, index) => {
            return (
              <div className="text-black text-xl " key={index}>
                <HomeCard
                  fon={fon}
                  del={deleteForm}
                  rename={renameForm}
                  id={fon._id}
                  cleanfun={cleanfun}
                />
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default Home;
