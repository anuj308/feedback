import { useState } from 'react'
import './App.css'
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Navabar from './components/Navabar';
import Footer from './components/Footer';
import CreateForm from './pages/CreateForm';
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'
function App() {
  // const [data, setData] = useState({});

  return (
    <>


      {/* <Login /> */}
      {/* <SignUp/> */}
      {/* <h1>lets build i can do it</h1>
      <CreateForm/> */}


      <Navabar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/create' element={<CreateForm />} />
        {/* <Route path='/Forms' element={} /> */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<SignUp />} />
      </Routes>
      <Footer />

    </>
  )
}

export default App
