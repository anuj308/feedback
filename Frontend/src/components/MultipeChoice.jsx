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
         className="w-4 h-4 border-gray-300 dark:border-gray-600 text-blue-600 bg-gray-100 dark:bg-gray-700 focus:ring-blue-500"
         />
         ) : (
           <input
           type="radio"
           className="w-4 h-4 border-gray-300 dark:border-gray-600 text-blue-600 bg-gray-100 dark:bg-gray-700"
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
          <div className="m-1 w-8 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer" onClick={() => del(id)}>
            {" "}
            X
          </div>
        )}
      </div>
    </>
  );
};

export default MultipeChoice;
