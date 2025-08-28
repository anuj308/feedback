import React from "react";
import Input from "./Input/Input";

const MultipeChoice = ({
  choice = "",
  del,
  id=23223,
  mul,
  change,
  forFormSurvey = false,
}) => {
  // console.log(mul.other)
  return (
    <>
      <div className="flex items-center mb-4 w-full">
        {forFormSurvey ? (
         <input
         type="radio"
         name="answer"
         value={choice}
         onClick={(event) => change(event)}
         className="w-4 h-4 border-gray-300 "
         />
         ) : (
           <input
           type="radio"
           className="w-4 h-4 border-gray-300 "
           readOnly
          />
        )}

        <div className="m-1 w-full">
          {mul.other ? (
            <>
            {forFormSurvey?<Input
                type="text"
                readOnly
                disabled
                // onChange={(event)=>change(event,id)}
                className="block w-full p-2  rounded-lg  text-xs "
              />:<Input
                type="text"
                placeholder="Other"
                onChange={(event)=>change(event,id)}
                className="block w-full p-2  rounded-lg  text-xs "
              />}
              
            </>
          ) : (
            <>
              <Input
                type="text"
                value={choice}
                placeholder="option"
                onChange={(event)=>change(event,id)}
                // onChange={(event) => changeForSurvey(event)}
                className="block w-full p-2  rounded-lg  text-xs "
              />
            </>
          )}
        </div>
        {forFormSurvey ? (
          ""
        ) : (
          <div className="m-1 w-8" onClick={() => del(id)}>
            {" "}
            X
          </div>
        )}
      </div>
    </>
  );
};

export default MultipeChoice;
