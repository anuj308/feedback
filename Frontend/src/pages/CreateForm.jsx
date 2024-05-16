import React, { useState, useEffect, useContext } from "react";
import { Button, FormHead, InputCard } from "../components/index";
import { StoreContext } from "../Context/StoreContext";
import { useNavigate } from "react-router-dom";
const CreateForm = () => {
  const { status, url,cards,createForm } = useContext(StoreContext);

  // const [cards, setcards] = useState([
  //   {
  //     data: {
  //       id: 1,
  //       question: "",
  //       titlePlaceholder: "Question",
  //       description: "",
  //       descriptionPlaceholder: "Description",
  //       option: "Shortanswer",
  //       required: false,
  //       select: true,
  //       name1: "question",
  //       name2: "description",
  //     },
  //     multipleChoice: [{ index: 1, value: "", id: Date.now() }],
  //   },
  // ]);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const cards = JSON.parse(localStorage.getItem("cards"))
  //   if (cards && cards.length > 0) {
  //     setcards(cards);
  //   }
   
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem("cards",JSON.stringify(cards))
  // }, [cards]);
  return (
    <div>
      <div className="mx-auto w-1/2 mt-14 rounded overflow-hidden shadow-lg">
        <FormHead />
        <div className="my-8 ">
          {cards.map((card, id) => {
            // console.log(card);
            return (
              <div key={id}>
                <InputCard
                  card={card.data}
                  question={card.data.question}
                  option={card.data.option}
                  titlePlaceholder={card.data.titlePlaceholder}
                  description={card.data.description}
                  descriptionPlaceholder={card.data.descriptionPlaceholder}
                  className={card.data.className}
                  id={card.data.id}
                  required={card.data.required}
                  name1={card.data.name1}
                  name2={card.data.name2}
                  select={card.data.select}
                  multipleChoice={card.multipleChoice}
                  // setMultipleChoice={setMultipleChoice}
                />
                {/* <InputCard card={card.data}  /> */}
              </div>
            );
          })}
        </div>
        <Button onClick={() => createForm()} className="flex">
          Done
        </Button>
      </div>
    </div>
  );
};

export default CreateForm;
