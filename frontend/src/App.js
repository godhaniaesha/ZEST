import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import '../src/styles/d_style.css';
import '../src/styles/h_style.css';
import '../src/styles/x_style.css';
import '../src/styles/z_style.css';
import Home from './pages/Home';
import ContactUs from './pages/ContactUs';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Auth from './components/Auth';
import AboutUs from './pages/AboutUs';
import AppRoutes from '../src/admin/Approutes';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ marginTop: '70px' }}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Navbar />} />
          <Route path="/home" element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <AppRoutes />
        </Routes>
      </div>
      {/* <Footer /> */}
    </BrowserRouter>
  );
}

export default App;