import React, { useContext, useEffect, useState } from "react";
import { Input, MultipeChoice, Select, CheckBox } from "./index.js";
import { useForms } from "../Context/StoreContext.jsx";

const FormCard = ({
  card,
  id,
  question,
  description,
  option,
  updateCard,
  multipleChoice,
  checkBoxes,
}) => {
  const [checkBoxesF, setCheckboxesF] = useState(checkBoxes);

  const [answer, setAnswer] = useState("");

  const onChangeHandler = (event) => {
    const value = event.target.value;
    setAnswer(value);
  };

  const checkAnsFunc = (event, info) => {
    const id = info.id;
    console.log(id, info);
    setCheckboxesF((prev) => prev.map((ch) => (ch.id == id ? info : ch)));
  };
  useEffect(()=>{console.log(checkBoxesF)},[checkBoxesF])

  return (
    <div
      className="mx-auto bg-red-400 border rounded-2xl m-3  "
      key={id}
      // onClick={() => updateCard(id, {id,data:{id,option,question,description,answer},multipleChoice,checkBoxes:checkBoxesF})}
    >
      <div className="flex flex-row bg-red-700 px-6 pt-4 rounded-2xl pb-2">
        <div className="w-full">
          <input
            type="text"
            className={`mb-6 bg-white  text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor  `}
            value={card.data.question}
            disabled
          />

          {card.data.description && (
            <input
              type="text"
              className={`mb-6 bg-white  text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor  `}
              value={card.data.description}
              disabled
            />
          )}
        </div>
      </div>

      <div>
        <div className="px-6 pt-4 ">
          {card.data.option === "Shortanswer" && (
            <>
              <Input
                type="text"
                placeholder={"Your answer"}
                name="answer"
                onChange={(event) => onChangeHandler(event)}
                value={answer}
              />
            </>
          )}
          {card.data.option === "Multipechoice" && (
            <>
              <h1>Multipechoice</h1>
              <div className="flex items-center mb-4 flex-row space-x-3">
                <div className="m-1 w-full">
                  {multipleChoice.map((mul, index) => (
                    <div key={index} className="m-1 w-full">
                      <MultipeChoice
                        mul={mul}
                        change={onChangeHandler}
                        id={mul.id}
                        choice={mul.value}
                        forFormSurvey={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {card.data.option === "Checkboxes" && (
            <>
              {checkBoxes.map((check) => (
                <div key={check.index} className="m-1 w-full">
                  <CheckBox
                    check={check}
                    change={checkAnsFunc}
                    id={check.id}
                    choice={check.value}
                    forFormSurvey={true}
                  />
                </div>
              ))}
            </>
          )}
          {card.data.option === "Paragraph" && <h1>Paragraph</h1>}
          {card.data.option === "Fileupload" && <h1>Fileupload</h1>}
        </div>
      </div>

      <div className="px-6 pt-4 pb-2 flex flex-row space-x-3 flex-wrap mx-auto w-full ">
        <div
          onClick={() =>
            updateCard(id, {
              id,
              data: { id, option, question, description, answer },
              multipleChoice,
              checkBoxes:checkBoxesF,
            })
          }
          className="bg-red-100 border rounded p-2 "
        >
          save
        </div>
      </div>
    </div>
  );
};

export default FormCard;
