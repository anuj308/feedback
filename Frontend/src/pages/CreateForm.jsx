import React, { useState, useEffect, useContext } from "react";
import { Button, FormHead, InputCard } from "../components/index";
import { useForms } from "../Context/StoreContext";
import { useNavigate, useParams, useLoaderData } from "react-router-dom";
import axios from "axios";
import Admin from "./Admin";
const CreateForm = () => {
  // const { status, headData, setHead, cards, setCards, createFormFunc } =
  //   useForms();

  const navigate = useNavigate();
  const { fId } = useParams();

  const [cards, setcards] = useState([]);

  const [headData, setHeadData] = useState({});

  const setCards = (data) => {
    setcards(data);
  };

  const addCard = (info) => {
    setcards((prev) => [...prev, { id: Date.now(), ...info }]);
  };

  const updateCard = (id, info) => {
    setcards((prev) => prev.map((card) => (card.id === id ? info : card)));
    // console.log(cards);
  };
  const deleteCard = (id) => {
    console.log(id);
    setcards((prev) => prev.filter((card) => card.id != id));
  };

  const setHead = (info) => {
    setHeadData(info);
  };

  const onChangeHandler = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    setHeadData((prev) => ({ ...prev, [name]: value }));
  };


  const updateForm = async () => {
    const response = await axios.post("/api/v1/form/f/" + fId, {
      formTitle: headData.formTitle,
      formDescription: headData.formDescription,
      data: cards,
    });
    console.log("updated form", response);
    localStorage.removeItem("cards");
    setHead({
      formTitle: "Untitled Form",
      formDescription: "No Description",
    });
    navigate("/");
  };

  const [page, setPage] = useState("create")

  useEffect(() => {
    const func = async () => {
      try {
        const response = await axios.get("/api/v1/form/f/" + fId);
        setHead({
          formTitle: response.data.data.form.formTitle,
          formDescription: response.data.data.form.formDescription,
        });
        setCards(response.data.data.form.data);
        localStorage.setItem("cards", JSON.stringify(response.data.data.form.data));
        console.log(response.data.data.form.data)
      } catch (error) {
        console.log("error while fetching the create form", error);
      }
    };
    func();
    console.log(cards, "log")
  }, []);

  return (
    <div>
      <div className=" flex flex-row justify-evenly mx-auto mt-20 md:w-1/2 rounded overflow-hidden shadow-lg">
        <div className={`${ page=='create' ? "bg-red-600" : ""} p-3 hover:bg-gray-900 hover:text-white`} onClick={() => setPage("create")}>
          create
        </div>
        <div className={`${ page=='admin' ? "bg-red-600" : ""} p-3 hover:bg-gray-900 hover:text-white`} onClick={() => setPage("admin")}>
          admin
        </div>
      </div>
      {
        page === "create" ? (<div className="mx-auto md:w-1/2 mt-14 rounded overflow-hidden shadow-lg ">
          <FormHead headData={headData} onChangeHandler={onChangeHandler} />
          <div className="my-8 ">
            {cards.map((card, index) => {
              console.log(card);
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
                    addCard={addCard}
                    updateCard={updateCard}
                    deleteCard={deleteCard}
                    cards={cards}
                  />
                </div>
              );
            })}
          </div>
          <Button onClick={() => updateForm()} className="flex">
            Done
          </Button>
        </div>) : (<Admin formId={fId} />)
      }

    </div>
  );
};

export default CreateForm;
