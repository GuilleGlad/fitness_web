import logo from './logo.svg';
import './App.css';
import Homepage from './pages/Homepage';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
