import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';

import '../src/styles/d_style.css';
import '../src/styles/h_style.css';
import '../src/styles/x_style.css';
import '../src/styles/z_style.css';
import '../src/styles/menu_style.css';
import '../src/styles/profile.css';


import Home from './pages/Home';
import ContactUs from './pages/ContactUs';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Auth from './components/Auth';
import AboutUs from './pages/AboutUs';
import Menu from './pages/Menu';
import MenuDetail from './pages/MenuDetail';

import AppRoutes from './admin/Approutes';
import Services from './pages/Services';
import Reservation from './components/Reservation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import Blog from './pages/Blog';
import Gallery from './pages/Gallery';
import BlogDetail from './pages/BlogDetail';
import Profile from './pages/Profile';
import BarCafeHome from './pages/BarCafeHome';

function UserLayout({ children }) {
  return (
    <>
      <Navbar />

      <main className="x_main_content">
        {children}
      </main>

      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* USER ROUTES */}
          <Route path="/" element={<UserLayout>  <Home /> </UserLayout>} />
          <Route path="/home" element={<UserLayout>  <Home /> </UserLayout>} />
          <Route path="/cbhome" element={<UserLayout>  <BarCafeHome /> </UserLayout>} />
          <Route path="/aboutus" element={<UserLayout>  <AboutUs /> </UserLayout>} />
          <Route path="/contactus" element={<UserLayout>  <ContactUs /> </UserLayout>} />
          <Route path="/services" element={<UserLayout>  <Services /> </UserLayout>} />
          <Route path="/privacy-policy" element={<UserLayout>  <PrivacyPolicy /> </UserLayout>} />
          <Route path="/terms" element={<UserLayout>  <TermsAndConditions /> </UserLayout>} />
          <Route path="/menu" element={<UserLayout>  <Menu /> </UserLayout>} />
          <Route path="/menu/:id" element={<UserLayout>  <MenuDetail /> </UserLayout>} />
          <Route path="/auth" element={<UserLayout>  <Auth /> </UserLayout>} />
          <Route path="/blog" element={<UserLayout>  <Blog /> </UserLayout>} />
          <Route path="/gallery" element={<UserLayout>  <Gallery/> </UserLayout>} />
          <Route path="/blog/:id" element={<UserLayout>  <BlogDetail /> </UserLayout>} />

          <Route path="/reservations" element={<UserLayout> <Reservation /> </UserLayout> } />
          <Route path="/profile" element={<UserLayout> <Profile /> </UserLayout> } />

          {/* ADMIN ROUTES */}
          <Route path="/admin/*" element={<AppRoutes />} />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;