import React from "react";
import { useNavigate } from "react-router-dom";


const HomeCard = ({ fon,del,rename,id,cleanfun }) => {
  const navigate = useNavigate()

  const naviagteToCreateForm = ()=>{
    // cleanfun()
    navigate("/create/"+id)
  }
  return (
    <>
      <div className="m-3 max-w-sm rounded overflow-hidden shadow-lg">
        <div className="px-6 py-4"  onClick={()=> naviagteToCreateForm()}>
          <div className="font-bold text-xl mb-2">{fon.formTitle}</div>
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
