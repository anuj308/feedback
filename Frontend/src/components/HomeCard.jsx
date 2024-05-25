import React from "react";
import { useNavigate } from "react-router-dom";


const HomeCard = ({ fon,del,rename,id }) => {
  const navigate = useNavigate()
  return (
    <>
      <div className="m-11 max-w-sm rounded overflow-hidden shadow-lg">
        {/* <img className="w-full" src="/img/card-top.jpg" alt="Sunset in the mountains"/> */}
        <div className="px-6 py-4"  onClick={()=> navigate("/create/"+id)}>
          <div className="font-bold text-xl mb-2">{fon.formTitle}</div>
          {/* <p className="text-gray-700 text-base">
            {fon.headData.formDescription}{" "}
          </p> */}
        </div>
        <div className="px-6 pt-4 pb-2 flex flex-row space-x-3 flex-wrap mx-auto w-full ">
          <div
            onClick={() => del(fon._id)}
            className="bg-red-100 border rounded p-2 "
          >
            delete
          </div>
          <div
            onClick={() => rename(fon._id,!fon.formTitle?"Untitled Form":fon.formTitle)}
            className="bg-red-100 border rounded p-2 "
          >
            Rename
          </div>
          <div
            onClick={() => navigate("/form/"+id)}
            className="bg-red-100 border rounded p-2 "
          >
            Form
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeCard;
