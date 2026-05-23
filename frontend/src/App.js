import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import '../src/styles/d_style.css';
import '../src/styles/h_style.css';
import '../src/styles/x_style.css';
import '../src/styles/z_style.css';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import AboutUs from './pages/AboutUs';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar />} />
        <Route path="/home" element={<Home />} />
        <Route path="/aboutus" element={<AboutUs />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
