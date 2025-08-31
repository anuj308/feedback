import React from "react";
import { useNavigate } from "react-router-dom";


const HomeCard = ({ fon,del,rename,id,cleanfun }) => {
  const navigate = useNavigate()

  const naviagteToCreateForm = ()=>{
    // cleanfun()
    navigate("/create/"+id)
  }
  return (
    <>
      <div className="m-3 max-w-sm rounded overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={()=> naviagteToCreateForm()}>
          <div className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{fon.formTitle}</div>
        </div>
        <div className="px-6 pt-4 pb-2 flex flex-row space-x-3 flex-wrap mx-auto w-full">
          <div
            onClick={() => del(fon._id)}
            className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 rounded p-2 cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
          >
            delete
          </div>
          <div
            onClick={() => rename(fon._id,!fon.formTitle?"Untitled Form":fon.formTitle)}
            className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded p-2 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          >
            Rename
          </div>
          <div
            onClick={() => navigate("/form/"+id)}
            className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 rounded p-2 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
          >
            Form
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeCard;
