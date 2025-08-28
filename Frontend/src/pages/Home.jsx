import React, { useEffect, useState } from "react";
import { HomeCard, RenameCard } from "../components/index.js";
import { api, endpoints } from "../utils/api";
import { useForms } from "../Context/StoreContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [allForms, setAllForms] = useState([]);
  const navigate = useNavigate();
  const c = localStorage.getItem("userData");
  const userData = JSON.parse(c);
  const {
    token,
    setHead,
  } = useForms();
  const [showRename, setShowRename] = useState(false);
  const [status, setStatus] = useState(false);
  const deleteForm = async (id) => {
    console.log("🗑️ Deleting form:", id);
    try {
      const response = await api.delete(endpoints.forms.delete(id));
      console.log("✅ Form deleted successfully");
      
      // Refresh forms list
      const formsResponse = await api.get(endpoints.forms.getByOwner(userData._id));
      setAllForms(formsResponse.data.data.form);
    } catch (error) {
      console.error("❌ Error deleting form:", error);
    }
  };

  const toCreate = () => {
    if (status === false) {
      navigate("/login");
    } else {
      navigate("/create");
    }
  };
  // for rename of form
  const [formTitle, setFormTitle] = useState("");
  const [formRenameId, setFormRenameId] = useState("");
  const onChangeHandlerRename = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    setFormTitle(value);
  };

  const renameForm = (id, title) => {
    setFormTitle(title.length === 0 ? "Untitled Form" : title);
    setFormRenameId(id);
    setShowRename(true);
  };

  const cleanfun =()=>{
    localStorage.removeItem("cards");
    setHead({
      formTitle: "Untitled Form",
      formDescription: "No Description",
    });
  }

  useEffect(() => {
    try {
      const func = async () => {
        console.log("📋 Fetching forms for user:", userData._id);
        const response = await api.get(endpoints.forms.getByOwner(userData._id));
        console.log("📄 Forms loaded:", response.data.data.form.length, "forms");
        setAllForms(response.data.data.form);
      };
      if (token) {
        setStatus(true);
        if (allForms.length === 0) {
          func();
        }
      }
    } catch (error) {
      console.error("❌ Error while fetching all forms:", error);
    }
  }, [showRename]);
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
            className="m-44 border bg-white rounded-lg p-7 shadow-md"
          />
        </div>
      )}
      <div className=" min-h-[80vh] mt-16 my-20 px-6 pt-4 pb-2 flex flex-row flex-wrap justify-center mx-auto w-full">
        {allForms.length === 0 ? (
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
