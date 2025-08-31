import React, { useId } from "react";

function Select(
  { options,value, label, className = "", ...props },
  ref
) {
  const id = useId();
  return (<div className="w-full">{label && <label htmlFor={id}></label>}
    <select {...props}
    value={value}
      id={id}
      ref={ref}
      className={`${className} px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white outline-none focus:bg-gray-50 dark:focus:bg-gray-700 duration-200 border border-gray-200 dark:border-gray-600 w-full `}>
      {options?.map((option,index) => ( <option key={index} value={option.optionValue}>{option.option}</option> ))}
    </select>
  </div>
  )
}

export default React.forwardRef(Select)