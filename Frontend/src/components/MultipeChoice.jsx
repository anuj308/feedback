import React from "react";
import Input from "./Input/Input";

const MultipeChoice = ({ choice = "", del, id,  mul ,change}) => {
  // console.log(mul.other)
  return (
    <>
      <div className="flex items-center mb-4 w-full">
        <input
          id="country-option-1"
          type="radio"
          name="countries"
          value="USA"
          className="w-4 h-4 border-gray-300 "
          readOnly
        />
        <div className="m-1 w-full">
          {mul.other ? (
            <>
              <Input
                type="text"
                readOnly
                placeholder="Other"
                onChange={(event)=>change(event,id)}
                className="block w-full p-2  rounded-lg  text-xs "
              />
            </>
          ) : (
            <>
              <Input
                type="text"
                value={choice}
                placeholder="option"
                onChange={(event)=>change(event,id)}
                className="block w-full p-2  rounded-lg  text-xs "
              />
            </>
          )}
        </div>
        <div className="m-1 w-8" onClick={() => del(id)}>  X</div>
      </div>
    </>
  );
};

export default MultipeChoice;
