import React, { useContext, useEffect, useState } from "react";
import { Input, MultipeChoice, Select, CheckBox } from "./index.js";
import { useForms } from "../Context/StoreContext.jsx";

const InputCard = ({
  titlePlaceholder = "Question",
  description = "",
  descriptionPlaceholder = "Description",
  className = "",
  option = "Shortanswer",
  id,
  question,
  required = false,
  select,
  name1,
  name2,
  card,
  ...props
}) => {
  const { cards, setCards, addCard, updateCard, deleteCard } = useForms();

  const [options, setoptions] = useState([
    { option: "Short answer", optionValue: "Shortanswer" },
    { option: "Paragraph", optionValue: "Paragraph" },
    { option: "Multipe choice", optionValue: "Multipechoice" },
    { option: "Checkboxes", optionValue: "Checkboxes" },
    { option: "Drop down", optionValue: "Dropdown" },
    { option: "File upload", optionValue: "Fileupload" },
  ]);

  // n=multiple choice
  const [multipleChoice, setMultipleChoice] = useState([
    { index: 148798, value: "", id: Date.now() },
  ]);

  const addMul = (mInfo) => {
    setMultipleChoice((prev) => [...prev, { id: Date.now(), ...mInfo }]);
  };
  const delMul = (id) => {
    // console.log(id);
    setMultipleChoice((prev) => prev.filter((mul) => mul.id != id));
  };
  // check boxes choice
  const [checkBoxes, setCheckboxes] = useState([
    { index: 156787, value: "", id: Date.now() },
  ]);

  const addCheck = (mInfo) => {
    setCheckboxes((prev) => [...prev, { id: Date.now(), ...mInfo }]);
  };
  const delCheck = (id) => {
    setCheckboxes((prev) => prev.filter((mul) => mul.id != id));
  };

  // data of card
  const [data, setData] = useState({
    question: "",
    titlePlaceholder: "Question",
    description: "",
    descriptionPlaceholder: "",
    option: "Shortanswer",
    id: card.id,
    select: true,
    required: false,
    name1: "question",
    name2: "description",
  });

  const datadefault = {
    question: "",
    titlePlaceholder: "Question",
    description: "",
    descriptionPlaceholder: "Description",
    option: "Shortanswer",
    required: false,
    select: true,
    name1: "question",
    name2: "description",
  };

  const titleDescriptionData = {
    question: "",
    titlePlaceholder: "Title",
    description: "",
    descriptionPlaceholder: "Description",
    select: false,
    required: false,
    name1: "question",
    name2: "description",
  };

  const onChangeHandler = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    setData((prev) => ({ ...prev, [name]: value }));
  };
  const onChangeHandlerMul = (event, id) => {
    const value = event.target.value;
    const name = event.target.name;
    setMultipleChoice((prev) =>
      prev.map((mul) => (mul.id === id ? { ...mul, value: value } : mul))
    );
  };
  const onChangeHandlerCheck = (event, id) => {
    const value = event.target.value;
    const name = event.target.name;
    console.log(value,name)
    setCheckboxes((prev) =>
      prev.map((mul) => (mul.id === id ? { ...mul, value: value } : mul))
    );
  };

  const toogleReq = () => {
    const re = data.required;
    setData((prev) => ({ ...prev, required: !re }));
  };

  const datadefaultAll = { data: datadefault, multipleChoice ,checkBoxes};
  const titleDescriptionDataAll = {
    data: titleDescriptionData,
    multipleChoice: {},
    checkBoxes:{}
  };
  const dataAll = { data, multipleChoice,checkBoxes };

  // const delCard = ()=>{
  //   console.log("del",id)
  //   deleteCard(id)
  // }
  // console.log(dataAll);

  // const addTitleDesc = () => {
  //     addCard(titleDescriptionData);
  // };
  // const duplicate = () => {
  //     addCard(card);
  // };
  // const save = () => {
  //     updateCard(card.id, data);
  //     console.log("saving")
  //     console.log(cards)
  // };

  // useEffect(() => {
  //   console.log(multipleChoice);
  //   console.log(data);
  // }, [multipleChoice, data]);
  // console.log(data)

  return (
    <div className="mx-auto bg-red-400 border rounded-2xl m-3  " key={id}>
      <div className="flex flex-row bg-red-700 px-6 pt-4 rounded-2xl pb-2">
        <div className="w-full">
          <Input
            type="text"
            placeholder={titlePlaceholder}
            className="my-3"
            name={name1}
            onChange={onChangeHandler}
            value={data.question}
            {...props}
            {...(required ? "required" : "")}
          />
          {/* {description &&
                <Input type="text" value={description} placeholder={descriptionPlaceholder} {...props} {...required ? "required" : ""} />
            } */}
          {titlePlaceholder == "Title" && (
            <Input
              type="text"
              placeholder={card.descriptionPlaceholder}
              {...props}
              name={card.name2}
              onChange={onChangeHandler}
              value={data.description}
              {...(required ? "required" : "")}
            />
          )}
        </div>
        {/* <DropDown className='px-6 pt-4 pb-2 '/> */}
        <div className="w-full">
          {select && (
            <Select
              className="px-6 pt-4 pb-2 mx-3 my-4"
              options={options}
              onChange={onChangeHandler}
              value={data.option}
              name="option"
            />
          )}
        </div>
      </div>

      <div>
        <div className="px-6 pt-4 ">
          {data.option === "Multipechoice" && (
            <>
              <h1>Multipechoice</h1>
              <div className="flex items-center mb-4 flex-row space-x-3">
                <div className="m-1 w-full">
                  {multipleChoice.map((mul) => (
                    <>
                      <div key={mul.index} className="m-1 w-full">
                        <MultipeChoice
                          mul={mul}
                          change={onChangeHandlerMul}
                          id={mul.id}
                          choice={mul.value}
                          del={delMul}
                        />
                      </div>
                    </>
                  ))}
                  <input
                    id="country-option-1"
                    type="radio"
                    name="countries"
                    value="USA"
                    className="w-4 h-4 "
                    readOnly
                  />
                  <span
                    onClick={() =>
                      addMul({ index: multipleChoice.length + 1, value: "" })
                    }
                  >
                    {"  "}
                    Add option{" "}
                  </span>{" "}
                  or{" "}
                  <span
                    onClick={() =>
                      addMul({
                        index: multipleChoice.length + 1,
                        value: "",
                        other: true,
                      })
                    }
                  >
                    {" "}
                    Add "Other"
                  </span>
                </div>
              </div>
            </>
          )}
          {data.option === "Checkboxes" && (
            <>
              <h1>Checkboxes</h1>

              {checkBoxes.map((check) => (
                <>
                  <div key={check.index} className="m-1 w-full">
                    <CheckBox
                      check={check}
                      change={onChangeHandlerCheck}
                      id={check.id}
                      choice={check.value}
                      del={delCheck}
                    />
                  </div>
                 
                </>
              ))}
               <input
                    id="country-option-1"
                    type="radio"
                    name="countries"
                    value="USA"
                    className="w-4 h-4 "
                    readOnly
                  />
                  <span
                    onClick={() =>
                      addCheck ({ index: checkBoxes.length + 1, value: "" })
                    }
                  >
                    {"  "}
                    Add option{" "}
                  </span>{" "}
            </>
          )}
          {data.option === "Paragraph" && <h1>Paragraph</h1>}
          {data.option === "Fileupload" && <h1>Fileupload</h1>}
        </div>
      </div>

      {/* <div className="max-w-sm rounded overflow-hidden shadow-lg"> */}
      <div className="px-6 pt-4 pb-2 flex flex-row space-x-3 flex-wrap mx-auto w-full ">
        <div
          onClick={() => addCard(datadefaultAll)}
          className="bg-red-100 border rounded p-2 "
        >
          add
        </div>
        <div
          onClick={() => addCard(titleDescriptionDataAll)}
          className="bg-red-100 border rounded p-2 "
        >
          title desc
        </div>
        <div
          onClick={() => deleteCard(id)}
          className="bg-red-100 border rounded p-2 "
        >
          Delete
        </div>
        <div
          onClick={() => addCard(dataAll)}
          className="bg-red-100 border rounded p-2 "
        >
          Duplicate
        </div>
        <div className="bg-red-100 border rounded p-2 ">
          <div>
            <label className="inline-flex items-center mb-5 cursor-pointer">
              <input
                onClick={() => toogleReq()}
                type="checkbox"
                value=""
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-black ">
                Required
              </span>
            </label>
          </div>
        </div>
        {card.select ? "" : (data.select = false)}

        <div
          onClick={() => updateCard(id, dataAll)}
          className="bg-red-100 border rounded p-2 "
        >
          save
        </div>
      </div>
    </div>
  );
};

export default InputCard;
