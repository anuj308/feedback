import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FormHead, Button, FormCard } from "../components/index";

const Form = () => {
  const { fId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [dark, setDark] = useState(false);
  const [formTitle, setformTitle] = useState("");
  const [formDescription, setformdescription] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [formId, setFormId] = useState("");
  const updateCard = (id, info) => {
    console.log(id, info);
    setCards((prev) => prev.map((card) => (card.id === id ? info : card)));
  };
  const [save, setSave] = useState(false);

  const storeForm = async () => {
    try {
      console.log(  ownerId,formId)
      const response = await axios.post("/api/v1/store", {
        formTitle,
        formDescription,
        data: cards,
        ownerId,
        formId,
      });
      console.log(response);
      navigate("/");
      // make a page for like got your response etc
    } catch (error) {
      console.log("error while sending data to server", error);
    }
  };

  useEffect(() => {
    // console.log(fId);

    const func = async () => {
      try {
        const response = await axios.get("/api/v1/form/f/" + fId);
        setformTitle(response.data.data.form.formTitle);
        setformdescription(response.data.data.form.formDescription);
        setOwnerId(response.data.data.form.Owner);
        // console.log(response.data.data.form._id);
        setFormId(response.data.data.form._id);
        setCards(response.data.data.form.data);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };
    func();
  }, []);

  useEffect(() => {
    console.log(cards);
  }, [cards]);

  return (
    <>
      <div className="mx-auto w-1/2 mt-14 rounded overflow-hidden shadow-lg">
          <div className="m-3 px-6 py-4">
            <div className="text-xl mb-2">
              <input
                type="text"
                className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200  border-gray-200 w-full`}
                value={formTitle}
                disabled
                readOnly
              />
            </div>
            <input
              type="text"
              className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200  border-gray-200 w-full`}
              value={formDescription}
              disabled
              readOnly
            />
          </div>
        <div className="flex flex-col justify-center items-center">

          <div className="m-3 w-full p-1">
            {cards.map((card, index) => {
              return (
                <div key={index}>
                  <FormCard
                    card={card}
                    updateCard={updateCard}
                    id={card.id}
                    option={card.data.option}
                    question={card.data.question}
                    description={card.data.description}
                    multipleChoice={card.multipleChoice}
                    checkBoxes={card.checkBoxes}
                    save={save}
                    setSave={setSave}
                  />
                </div>
              );
            })}
          </div>
          <Button onClick={() => storeForm()} className="flex">
            Done
          </Button>
        </div>
      </div>
    </>
  );
};

export default Form;
