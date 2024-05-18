import React from "react";
import Input from "./Input/Input";

const CheckBox = ({ choice = "", del, id, check, change }) => {
  return (
    <>
      <div className="flex items-center mb-4 w-full">
        <input
          id="checkbox-3"
          type="checkbox"
          value=""
          className="w-4 h-4 border-gray-300 "
        />
        {/* <label
        for="checkbox-3"
        className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
      > */}
        <Input
          type="text"
          placeholder="checkbox"
          value={choice}
          onChange={(event) => change(event, id)}
          className="block w-full p-2 m-1 rounded-lg  text-xs "
        />
        {/* </label> */}
        <div onClick={() => del(id)} className="mx-3 w-8">
          {" "}
          X{" "}
        </div>
      </div>
    </>
  );
};

export default CheckBox;
