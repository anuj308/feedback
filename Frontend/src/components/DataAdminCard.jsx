import React, { useEffect } from "react";
import Form from "../pages/Form.jsx";
import { Input, MultipeChoice, Select, CheckBox } from "./index.js";
const DataAdminCard = ({
  card,
  id,
  question,
  description,
  option,
  updateCard,
  multipleChoice,
  checkBoxes,
}) => {
  // const [checkBoxesF, setCheckboxesF] = useState(checkBoxes);

  // const [answer, setAnswer] = useState("");

  // const onChangeHandler = (event) => {
  //   const value = event.target.value;
  //   setAnswer(value);
  // };

  // const checkAnsFunc = (event, info) => {
  //   const id = info.id;
  //   console.log(id, info);
  //   setCheckboxesF((prev) => prev.map((ch) => (ch.id == id ? info : ch)));
  // };

  useEffect(() => {
    console.log(card);
  }, []);

  return (
    <div
      className="mx-auto bg-red-400 dark:bg-red-600 border border-red-300 dark:border-red-500 rounded-2xl m-3"
      key={id}
      // onClick={() => updateCard(id, {id,data:{id,option,question,description,answer},multipleChoice,checkBoxes:checkBoxesF})}
    >
      {/* <div className="flex flex-row bg-red-700 px-6 pt-4 rounded-2xl pb-2">
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
      </div> */}
      <div className="px-6 pt-4 m-3 flex flex-col justify-between">
      <input
            type="text"
            className={`mb-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 border border-gray-300 dark:border-gray-600 block w-full p-2.5 cursor-not-allowed`}
            value={card.data.question}
            disabled
          />
        <Input
          type="text"
          placeholder={"Your answer"}
          name="answer"
          value={card.data.answer}
        />
      </div>
    </div>
  );
};

export default DataAdminCard;
