import React, { useState, useEffect, useContext } from "react";
import { Button, FormHead, InputCard } from "../components/index";
import { useForms } from "../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const CreateForm = () => {
  const { status,headData,cards,createFormFunc, } = useForms();

  const navigate = useNavigate();

  const createForm = async () => {
    try {
      const response = await axios.post("/api/v1/form/create" , {
        formTitle:headData.formTitle,
        formDescription:headData.formDescription,
        data: cards,
      });
      console.log(response);
      // localStorage.setItem("cards",cards)
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };



  return (
    <div>
      <div className="mx-auto w-1/2 mt-14 rounded overflow-hidden shadow-lg">
        <FormHead />
        <div className="my-8 ">
          {cards.map((card, id) => {
           console.log(card)
           console.log(card.data.question)
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
                  id={card.id}
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
