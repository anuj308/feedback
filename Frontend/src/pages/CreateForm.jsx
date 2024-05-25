import React, { useState, useEffect, useContext } from "react";
import { Button, FormHead, InputCard } from "../components/index";
import { useForms } from "../Context/StoreContext";
import { useNavigate, useParams, useLoaderData } from "react-router-dom";
import axios from "axios";
const CreateForm = () => {
  const { status, headData, setHead, cards, setCards, createFormFunc } =
    useForms();

  const navigate = useNavigate();
  const { fId } = useParams();

  const func = async () => {
    try {
      const response = await axios.get("/api/v1/form/f/" + fId);
      setHead({
        formTitle: response.data.data.form.formTitle,
        formDescription: response.data.data.form.formDescription,
      });
      setCards(response.data.data.form.data);
    } catch (error) {
      console.log("error while fetching the create form", error);
    }
  };

  const updateForm = async () => {
    const response = await axios.post("/api/v1/form/f/" + fId, {
      formTitle: headData.formTitle,
      formDescription: headData.formDescription,
      data: cards,
    });
    console.log("updated form",response)
    localStorage.removeItem("cards");
    navigate("/")
  };

  useEffect(() => {
    func();
  }, []);
  // useEffect(() => {
  //   updateForm()
  // }, [cards]);
  return (
    <div>
      <div className="mx-auto w-1/2 mt-14 rounded overflow-hidden shadow-lg">
        <FormHead headData={headData} />
        <div className="my-8 ">
          {cards.map((card, index) => {
            // console.log(card);
            return (
              <div key={index}>
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
                  multipleChoiceC={card.multipleChoice}
                  checkBoxesC={card.checkBoxes}
                />
              </div>
            );
          })}
        </div>
        <Button onClick={() => updateForm()} className="flex">
          Done
        </Button>
      </div>
    </div>
  );
};

export default CreateForm;
