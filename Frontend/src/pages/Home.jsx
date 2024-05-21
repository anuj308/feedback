import React, { useEffect, useState } from "react";
import { HomeCard, RenameCard } from "../components/index.js";
import axios, { all } from "axios";
import { useForms } from "../Context/StoreContext";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const [allForms, setAllForms] = useState([]);
  const navigate = useNavigate();
  const {
    // status,
    // changeStatus,
    token,
    headData,
    // onChangeHandler,
    cards,
    userData,
  } = useForms();
  const [showRename, setShowRename] = useState(false);
  const [status, setStatus] = useState(false);
  const deleteForm = async (id) => {
    try {
      const response = await axios.delete("/api/v1/form/f/" + id);
      const func = async () => {
        const response = await axios.get("/api/v1/form");
        setAllForms(response.data.data.form);
        // console.log(response.data.data.form);
      };
      func();
    } catch (error) {
      console.log(error);
    }
  };

  const toCreate = () => {
    // console.log(status);
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
    // console.log(value,name)
    setFormTitle(value);
  };

  const renameForm = (id, title) => {
    // console.log(title);
    setFormTitle(title.length === 0 ? "Untitled Form" : title);
    setFormRenameId(id);
    // console.log(id);
    setShowRename(true);
  };

  // const renameForm

  useEffect(() => {
    try {
      // console.log(status, cards, userData);
      // console.log(allForms);
      // console.log(headData);
      // console.log(token);
      const func = async () => {
        const response = await axios.get("/api/v1/form");
        setAllForms(response.data.data.form);
        // console.log(response.data.data.form);
      };
      if (token) {
        // console.log(token);
        setStatus(true);
        if (allForms.length === 0) {
          func();
        }
        // console.log(token);
        // changeStatus(true);
        // console.log(status);
      }
    } catch (error) {
      console.log("while fetching all forms", error);
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
      <div className="h-80v px-6 pt-4 pb-2 flex flex-row flex-wrap justify-center mx-auto w-full">
        {allForms.length === 0 ? (
          <h1 className=" text-black text-3xl flex justify-center items-center h-80v ">
            No Form Exist -
            <span className="hover:text-blue-400" onClick={() => toCreate()}>
              Create now
            </span>
          </h1>
        ) : (
          allForms.map((fon, index) => {
            // console.log("it is fon",fon);
            return (
              <div className="text-black text-xl " key={index}>
                <HomeCard fon={fon} del={deleteForm} rename={renameForm} id={fon._id} />
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default Home;
