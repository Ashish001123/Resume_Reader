import AiChatContainer from './components/aiChatContainer'
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { aiStore } from "./store/aiStore"
import './App.css'

function App() {
  const { authUser } = aiStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={authUser ? <AiChatContainer /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
