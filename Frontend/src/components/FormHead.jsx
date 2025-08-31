import React, { useContext, useState } from "react";
import { Input } from "./index.js";
import { useForms } from "../Context/StoreContext.jsx";

const FormHead = ({ onChangeHandler, headData, readOnly = false }) => {
  if (readOnly) {
    return (
      <div className="m-3 px-6 py-4">
        <div className="text-xl mb-2">
          <div className="text-gray-900 font-semibold text-2xl">
            {headData.formTitle}
          </div>
        </div>
        {headData.formDescription && (
          <div className="text-gray-700 text-base">
            {headData.formDescription}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="m-3 px-6 py-4">
        <div className="text-xl mb-2">
          <Input
            type="text"
            onChange={onChangeHandler}
            name="formTitle"
            value={headData.formTitle}
            placeholder="Untitled form"
          />
        </div>
        <Input
          type="text"
          onChange={onChangeHandler}
          name="formDescription"
          value={headData.formDescription}
          placeholder="Form description"
        />
      </div>
    </>
  );
};

export default FormHead;
