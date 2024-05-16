import React, { useContext, useState } from "react";
import { Input } from "./index.js";
import { StoreContext } from "../Context/StoreContext.jsx";

const FormHead = () => {
  const { onChangeHandler, headData } = useContext(StoreContext);

  return (
    <>
      <div className="m-3 px-6 py-4">
        <div className="text-xl mb-2">
          <Input
            type="text"
            onChange={onChangeHandler}
            name="formTitle"
            value={headData.title}
            placeholder="Untitled form"
          />
        </div>
        <Input
          type="text"
          onChange={onChangeHandler}
          name="formDescription"
          value={headData.description}
          placeholder="Untitled descripttion"
        />
      </div>
    </>
  );
};

export default FormHead;
