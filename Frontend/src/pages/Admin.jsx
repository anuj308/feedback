import axios from "axios";
import React, { useEffect, useState } from "react";
import { AdminIndividualCard, DataAdminCard, FormCard } from "../components";
import Form from './Form.jsx'

const Admin = ({ formId }) => {
  const [dropdown, setDropDown] = useState(false);
  const [selectOption, setSelectOption] = useState("summary");
  const [store, setStore] = useState([]);
  const [StoreForm, setStoreForm] = useState([]);


  const toogleResponse = async()=>{
    try {
      const response = await axios.get('/api/v1/form/admin/'+formId);
      console.log(response.data.message)
    } catch (error) {
      console.log(error)
    }
  }
  console.log(store)

  useEffect(() => {
    const func = async () => {
      try {
        const response = await axios.get("/api/v1/store/f/" + formId);
        console.log(response);
        setStore(response.data.data);
        // console.log(response.data.data)
        // console.log(store)
        // console.log(response.data.data)
      } catch (error) {
        console.log(error, formId);
      }
    };
    func();
    console.log(StoreForm)
  }, [StoreForm]);
  return (
    <div classNameName="mx-auto w-1/2 mt-28  rounded overflow-hidden shadow-lg">
      <div className=" my-8  mt-32 text-white mx-auto w-1/2 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <div className="flex px-4 pt-4  flex-row justify-between">
          <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
            {store.length} responses
          </h5>
          <div>
            <button
              onClick={() => setDropDown((p) => !p)}
              className="inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5"
              type="button"
            >
              <span className="sr-only">Open dropdown</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 3"
              >
                <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
              </svg>
            </button>
            <div
              id="dropdown"
              className={`z-10 ${
                dropdown ? "" : "hidden"
              } text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow  absolute  dark:bg-gray-700`}
            >
              <ul className="py-2">
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Download all responses (in csv)
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Download all responses (in pdf)
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Delete all responses
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-white px-4 pt-4 flex justify-end">
          <label className="inline-flex items-center cursor-pointer" >
            <input type="checkbox" class="sr-only peer" onClick={()=> toogleResponse()}/>
            <span className="me-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Accepting responses
            </span>
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <ul className="grid gap-4 md:grid-cols-3  w-full   px-10 text-sm font-medium text-center text-gray-500 border-b border-gray-200 rounded-t-lg bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800">
            <li
              className={`me-2 w-auto rounded-ss-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                selectOption === "summary" ? "dark:text-blue-500" : "bg-white"
              } `}
              onClick={() => setSelectOption("summary")}
            >
              <button type="button" className="inline-block  w-auto p-4">
                Summary
              </button>
            </li>
            <li
              className={`me-2 w-auto rounded-ss-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                selectOption === "question" ? "dark:text-blue-500" : "bg-white"
              } `}
              onClick={() => setSelectOption("question")}
            >
              <button
                type="button"
                className="inline-block p-4 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                Question
              </button>
            </li>
            <li
              className={`me-2 w-auto rounded-ss-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                selectOption === "individual"
                  ? "dark:text-blue-500"
                  : "bg-white"
              } `}
              onClick={() => setSelectOption("individual")}
            >
              <button
                type="button"
                className="inline-block p-4 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                Individual
              </button>
            </li>
          </ul>
          <div id="defaultTabContent">
            <div
              className={`${
                selectOption === "summary" ? "" : "hidden"
              } p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800`}
              id="about"
            >
              {/* {store.map((s) => {
                s.map((st) => {
                  <FormCard
                    card={st.data}
                    id={st.id}
                    question={st.data.question}
                    description={st.data.description}
                    option={st.data.option}
                    multipleChoice={st.multipleChoice}
                    checkBoxes={st.checkBoxes}
                  />;
                });
              })} */}
            </div>
            <div
              className={`${
                selectOption === "question" ? "" : "hidden"
              } p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800`}
              id="services"
            >
              <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                We tial
              </h2>
              
            </div>
            <div
              className={`${
                selectOption === "individual" ? "" : "hidden"
              } p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800`}
            >
              {
                store.map((s)=>(
                  <AdminIndividualCard s={s} setStoreForm={setStoreForm} name={s.owner.fullName}/>
                ))
              }
            </div>
          </div>
        </div>

      </div>
        <div>
        <div className="m-3 w-full p-1">
            {StoreForm.map((card, index) => {
              return (
                <div key={index}>
                  <DataAdminCard
                    card={card}
                    // updateCard={updateCard}
                    id={card.id}
                    option={card.data.option}
                    question={card.data.question}
                    description={card.data.description}
                    multipleChoice={card.multipleChoice}
                    checkBoxes={card.checkBoxes}
                    // save={save}
                    // setSave={setSave}
                  />
                </div>
              );
            })}
          </div>
        </div>
    </div>
  );
};

export default Admin;
