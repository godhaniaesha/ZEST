import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import '../src/styles/d_style.css';
import '../src/styles/h_style.css';
import '../src/styles/x_style.css';
import '../src/styles/z_style.css';
import Home from './pages/Home';
import Navbar from './components/Navbar';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
