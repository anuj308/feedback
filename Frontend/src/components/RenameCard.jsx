import React, { useState } from "react";
import { api, endpoints } from "../utils/api";
const RenameCard = ({
  className = "",
  cancelState,
  cancel,
  formRenameId,
  formTitle,
  onChangeHandlerRename,
  setAllForms,
  userData,
}) => {
  // console.log(cancel,cancelState)
  const onOk = async () => {
    try {
      const response = await api.patch(endpoints.forms.update(formRenameId), {
        formTitle,
      });
      console.log(response);
      const func = async () => {
        const response = await api.get(endpoints.forms.getByOwner(userData._id));
        setAllForms(response.data.data.form);
        // console.log(response.data.data.form);
      };
      func();
      cancel(!cancelState);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="block mb-2 text-2xl font-medium text-black dark:text-white">Rename</div>
      <div className="block mt-4 text-xl font-small text-gray-500 dark:text-gray-400">
        Please enter a new name for the item:
      </div>

      <input
        type="text"
        name="formTitle"
        value={formTitle}
        onChange={(event) => onChangeHandlerRename(event)}
        className="bg-gray-50 dark:bg-gray-800 border mt-7 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder="Unititled Form"
        required
      />

      <div className="m-1 mt-3 flex flex-row">
        <button
          type="text"
          className="text-white m-3 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          onClick={() => cancel(!cancelState)}
        >
          Cancel
        </button>
        <button
          type="text"
          className="text-white m-3 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          onClick={() => onOk()}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default RenameCard;
