import React, { useState } from "react";
import DataAdminCard from "./DataAdminCard";

const AdminIndividualCard = ({ s, name ,setStoreForm}) => {
  const [details, setDetails] = useState(s);
  const [showData, setShowData] = useState(false);
  console.log(details);
  return (
    <>
      <div
        onClick={(e) => setStoreForm(details.data)}
        className="m-3 max-w-sm rounded overflow-hidden shadow-lg hover:bg-slate-900"
      >
          <div className="font-bold text-white text-xl mb-2">{name} </div>
          <div>X</div>
        </div>
    </>
  );
};

export default AdminIndividualCard;
