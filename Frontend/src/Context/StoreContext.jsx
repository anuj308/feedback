import { createContext, useContext } from "react";

export const FormContext = createContext({
  status: false,
  changeStatus: () => {},
  cards: [
    {
      data: {
        id: 23423421,
        question: "",
        titlePlaceholder: "Question",
        description: "",
        descriptionPlaceholder: "Description",
        option: "Shortanswer",
        required: false,
        select: true,
        name1: "question",
        name2: "description",
      },
      id: 1232212,
      multipleChoice: [{ index: 148798, value: "", id: Date.now() }],
      checkBoxes: [{ index: 156787, value: "", id: Date.now() }],
    },
  ],
  setCards: () => {},
  token: "",
  userData: {},
  setUser: () => {},
  headData: {},
  addCard: (info) => {},
  updateCard: (id, info) => {},
  deleteCard: () => {},
  createForm: () => {},
  onChangeHandler: () => {},
  setHead: () => {},
});

export const useForms = () => {
  return useContext(FormContext);
};

export const FormProvider = FormContext.Provider;
