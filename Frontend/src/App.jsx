import { useState, useEffect } from "react";
import "./App.css";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Navabar from "./components/Navabar";
import Footer from "./components/Footer";
import CreateForm from "./pages/CreateForm";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FormProvider } from "./Context/StoreContext";
import axios from "axios";
import Form from "./pages/Form";

function App() {
  const token = localStorage.getItem("token");

  // const url = `http://localhost:9000`;
  const [userData, setUserData] = useState({});

  const setUser = (data) => {
    setUserData(data);
  };

  const [status, setStatus] = useState(false);

  const changeStatus = (data) => {
    setStatus(data);
  };

  const [cards, setcards] = useState([
    {
      data: {
        id: 1232212,
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
      multipleChoice: [{ index: 68798, value: "", id: Date.now() }],
      checkBoxes: [{ index: 156787, value: "", id: Date.now() }],
    },
  ]);

  const [headData, setHeadData] = useState({
    formTitle: "Untitled Form",
    formDescription: "No Description",
  });

  const setCards = (data) => {
    setcards(data);
  };

  const addCard = (info) => {
    setcards((prev) => [...prev, { id: Date.now(), ...info }]);
  };

  const updateCard = (id, info) => {
    // console.log(id, info);
    setcards((prev) => prev.map((card) => card.id === id ? info : card));
    // console.log(cards);
  };
  const deleteCard = (id) => {
    console.log(id);
    setcards((prev) => prev.filter((card) => card.id != id));
  };

  const setHead = (info) => {
    // console.log(headData)
    setHeadData(info);
  };

  const onChangeHandler = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    // console.log(value,name)
    setHeadData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const cards = JSON.parse(localStorage.getItem("cards"));
    if (cards && cards.length > 0) {
      setcards(cards);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cards", JSON.stringify(cards));
    if (token) {
      // console.log(token);
      setStatus(true);
      // console.log(status);
    }
    console.log(" create cards updated ",cards)
  }, [cards]);
  // useEffect(() => {
  //   localStorage.setItem("cards", JSON.stringify(cards));
  //   if (token) {
  //     // console.log(token);
  //     setStatus(true);
  //     // console.log(status);
  //   }
  //   console.log("cards updated ",cards)
  // }, [cards]);

  return (
    <FormProvider
      value={{
        cards,
        headData,
        token,
        status,
        addCard,
        deleteCard,
        updateCard,
        userData,
        onChangeHandler,
        setHead,
        setCards,
        setUser,
        changeStatus,
      }}
    >
      <BrowserRouter>
        <Navabar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateForm />} />
          <Route path="/form/:fId" element={<Form />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </FormProvider>
  );
}

export default App;
