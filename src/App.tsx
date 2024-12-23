import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './components/Home';
import Login from './components/Login';
import Registration from './components/Registration';
import NotFound from './components/NotFound'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes >
          <Route path="home" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="registration" element={<Registration />} />
          <Route path="*" element={<NotFound />} />



        </Routes >
      </BrowserRouter>
    </>
  )
}

export default App;
