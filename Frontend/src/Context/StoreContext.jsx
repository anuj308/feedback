import { createContext, useContext } from "react";

export const FormContext = createContext({
  isAuthenticated: false,
  userData: {},
  setUser: () => {},
  login: async () => {},
  logout: async () => {},
  checkAuthStatus: async () => {},
  resetAppState: () => {},
  isLoading: false,
  // Legacy support (gradually remove these)
  status: false,
  token: "",
  changeStatus: () => {},
  updateToken: () => {},
});

export const useForms = () => {
  return useContext(FormContext);
};

export const FormProvider = FormContext.Provider;
