import React, { useState } from "react";
import Input from "./Input/Input";

const CheckBox = ({
  choice = "",
  del,
  id,
  check,
  change,
  forFormSurvey = false,
}) => {

  // const [checkTrue,setCheckTrue]=useState({
  //   id:check.id,
  //   index:check.index,
  //   value:check.value,
  //   answer:true
  // })
  // const [checkFalse,setCheckFalse]=useState({
  //   id:check.id,
  //   index:check.index,
  //   value:check.value,
  //   answer:false
  // })

  // const [checkState,setCheckState]=useState(false)

  // const changeFunc =(event)=>{
  //   if(checkState){
  //     setCheckState(false)
  //     change(event,checkFalse)
  //   }else{
  //     setCheckState(true)
  //     change(event,checkTrue)
  //   }
  // }
  return (
    <>
      <div className="flex items-center mb-4 w-full">
      {forFormSurvey ? (
         <input
         type="checkbox"
         name="answer"
         value={choice}
         onClick={(event) => change(event)}
         className="w-4 h-4 border-gray-300 dark:border-gray-600 text-blue-600 bg-gray-100 dark:bg-gray-700 rounded focus:ring-blue-500"
    
       />
        ) : (
          <input
            type="checkbox"
            className="w-4 h-4 border-gray-300 dark:border-gray-600 text-blue-600 bg-gray-100 dark:bg-gray-700 rounded"
            readOnly
          />
        )}

       
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
        {forFormSurvey ? (
          ""
        ) : (
          <div onClick={() => del(id)} className="mx-3 w-8 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer">
            X
          </div>
        )}
      </div>
    </>
  );
};

export default CheckBox;
