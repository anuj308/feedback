import { createContext, useContext } from "react";

export const FormContext = createContext({
  status: false,
  changeStatus: () => {},
  questions: [],
  setQuestions: () => {},
  token: "",
  userData: {},
  setUser: () => {},
  headData: {},
  addQuestion: (info) => {},
  updateQuestion: (id, info) => {},
  deleteQuestion: () => {},
  createForm: () => {},
  onChangeHandler: () => {},
  setHead: () => {},
});

export const useForms = () => {
  return useContext(FormContext);
};

export const FormProvider = FormContext.Provider;
