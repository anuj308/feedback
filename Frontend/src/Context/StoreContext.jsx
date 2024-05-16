import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const StoreContext = createContext({
  cards:[
    {
      data: {
        id: 1,
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
      multipleChoice: [{ index: 1, value: "", id: Date.now() }],
    }],
    userData:{}
});

const StoreContextProvider = (props) => {
  const navigate = useNavigate();
  const url = `http://localhost:9000`;
  const [status, setStatus] = useState(false);
  const [userData, setUserData] = useState({});
  // const [cards, setcards] = useState(
  //     [
  //         { id: 7, question: "Enter your name", option: 'Shortanswer', required: false, name1: 'question', name2: 'description', },
  //         //   { id: 7, question: "Enter your name", option: 'Paragraph',required:false ,name1:'question',name2:'description'},
  //         //   { id: 7, question: "Enter your name", option: 'Multipechoice',required:false ,name1:'question',name2:'description'},
  //         //   { id: 7, question: "Enter your name", option: 'Multipechoice',required:false ,name1:'question',name2:'description'}
  //     ]
  // )
  const [multipleChoice, setMultipleChoice] = useState([
    { index: 1, value: "", id: Date.now() },
  ]);
  const [cards, setcards] = useState([
    {
      data: {
        id: 1,
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
      multipleChoice: [{ index: 1, value: "", id: Date.now() }],
    },
  ]);

  const addCard = (info) => {
    setcards((prev) => [...prev, { id: Date.now(), ...info }]);
    // localStorage.setItem("cards",JSON.stringify(cards))
    // setcards(JSON.parse(localStorage.getItem("cards")));
    
    // console.log(cards)
  };
  const updateCard = (id, info) => {
    setcards((prev) => prev.map((card) => (card.id === id ? info : card)));
    console.log(cards);
    // localStorage.setItem("cards",JSON.stringify(cards))
    // setcards(JSON.parse(localStorage.getItem("cards")));
    
    setMultipleChoice([{ index: 1, value: "", id: Date.now() }]);
  };
  const deleteCard = (id) => {
    // console.log(id)
    setcards((prev) => prev.filter((card) => card.id != id));
    // localStorage.setItem("cards",JSON.stringify(cards))
    // setcards(JSON.parse(localStorage.getItem("cards")));
    
    // console.log(cards)
  };

  const [headData, setHeadData] = useState({
    formTitle: "",
    formDescription: "",
  });

  const onChangeHandler = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    // console.log(value,name)
    setHeadData((prev) => ({ ...prev, [name]: value }));
  };

  const createForm = async () => {
    try {
      const response = await axios.post("/api/v1/form", {
        headData,
        data: cards,
      });
      console.log(response);
      // localStorage.setItem("cards",cards)
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const contextValue = {
    status,
    setStatus,
    url,
    cards,
    setcards,
    addCard,
    updateCard,
    deleteCard,
    headData,
    onChangeHandler,
    userData,
    setUserData,
    createForm,
    multipleChoice,
    setMultipleChoice,
  };
  const [token, setToken] = useState("");

  useEffect(() => {
    // console.log(cards);
    if (localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      // setcards(JSON.parse(localStorage.getItem("cards")));
      // setcards(localStorage.getItem("cards"));
      // console.log(userData);
      // console.log(token);
      // console.log(status);
      // console.log(headData);
      // console.log(cards)
      setStatus(true);
    }
  }, [ cards, headData]);
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
