import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import '../src/styles/d_style.css';
import '../src/styles/h_style.css';
import '../src/styles/x_style.css';
import '../src/styles/z_style.css';
import '../src/styles/menu_style.css';

import Home from './pages/Home';
import ContactUs from './pages/ContactUs';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Auth from './components/Auth';
import AboutUs from './pages/AboutUs';
import Menu from './pages/Menu';
import MenuDetail from './pages/MenuDetail';

import AppRoutes from "./admin/Approutes";
import Services from "./pages/Services";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import Reservation from "./components/Reservation";

function App() {
  return (
    <BrowserRouter>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/auth" element={<Auth />} />
      </Routes>

      <div style={{ marginTop: "70px" }}>
        {/* User Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/navbar" element={<Navbar />} />
          {/* <Route path="/auth" element={<Auth />} /> */}
          <Route path="/home" element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path='/services' element={<Services />} />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/terms' element={<TermsAndConditions />} />
          <Route path='/menu' element={<Menu />} />
          <Route path='/menu/:id' element={<MenuDetail />} />
          <Route path="/reservation" element={<Reservation />} />
        </Routes>

        {/* Admin Routes */}
        <AppRoutes />
      </div>
      {/* <Footer /> */}
    </BrowserRouter>
  );
}

export default App;
