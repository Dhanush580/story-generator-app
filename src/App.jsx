import './App.css'
import Login from './components/logincomponent/Login'
import Signup from './components/signupcomponent/Signup'
import Navbar from './components/navbarcomponent/Navbar'
import Welcome from './components/welcomecomponent/Welcome'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import ChatComponent from './components/chatcomponent/ChatComponent'
function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Welcome/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/navbar' element={<Navbar/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/story-generation' element={<ChatComponent/>}/>
      </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
