import React, { useContext, useState } from "react";
import { Input } from "./index.js";
import { useForms } from "../Context/StoreContext.jsx";

const FormHead = () => {
  const { onChangeHandler, headData } = useForms()

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
          placeholder="Untitled descripttion"
        />
      </div>
    </>
  );
};

export default FormHead;
