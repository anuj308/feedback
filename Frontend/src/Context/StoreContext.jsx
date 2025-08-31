import { createContext, useContext } from "react";

export const FormContext = createContext({
  isAuthenticated: false,
  userData: {},
  user: null,
  forms: [],
  currentTheme: 'light',
  setUser: () => {},
  updateUser: () => {},
  setIsAuthenticated: () => {},
  setUserData: () => {},
  logout: async () => {},
  checkAuthStatus: async () => {},
  resetAppState: () => {},
  applyTheme: () => {},
  isLoading: false,
  setIsLoading: () => {},
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
