import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';

import '../src/styles/d_style.css';
import '../src/styles/h_style.css';
import '../src/styles/x_style.css';
import '../src/styles/z_style.css';
import '../src/styles/menu_style.css';
import '../src/styles/profile.css';
import '../src/styles/RatingModal.css';

import Home from './pages/Home';
import ContactUs from './pages/ContactUs';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Auth from './components/Auth';
import AboutUs from './pages/AboutUs';
import Menu from './pages/Menu';
import MenuDetail from './pages/MenuDetail';
import RatingModal from './pages/RatingModal';

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
import NewHome from './pages/NewHome';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';
import { useState, useEffect } from 'react';

function UserLayout({ children, showRatingModal, onRatingClose }) {
  return (
    <>
      <Navbar />

      <main className="x_main_content">
        {children}
      </main>

      <Footer />
      
      <RatingModal 
        isOpen={showRatingModal} 
        onClose={onRatingClose}
        onSubmit={(data) => console.log('Rating submitted:', data)}
        cafeOrBarName="ZEST Cafe & Bar"
      />
    </>
  );
}

function App() {
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    // Check if user already rated
    const hasRated = localStorage.getItem('userHasRated');
    
    // Show modal after 3 seconds on first visit or after order
    if (!hasRated) {
      const timer = setTimeout(() => {
        setShowRating(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRatingClose = () => {
    setShowRating(false);
    localStorage.setItem('userHasRated', 'true');
  };

  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* USER ROUTES */}
          <Route path="/" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <Home /> </UserLayout>} />
          <Route path="/home" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <Home /> </UserLayout>} />
          <Route path="/cbhome" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <BarCafeHome /> </UserLayout>} />
          <Route path="/newhome" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <NewHome /> </UserLayout>} />
          <Route path="/aboutus" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <AboutUs /> </UserLayout>} />
          <Route path="/contactus" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <ContactUs /> </UserLayout>} />
          <Route path="/services" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <Services /> </UserLayout>} />
          <Route path="/privacy-policy" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <PrivacyPolicy /> </UserLayout>} />
          <Route path="/terms" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <TermsAndConditions /> </UserLayout>} />
          <Route path="/menu" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <Menu /> </UserLayout>} />
          <Route path="/menu/:id" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <MenuDetail /> </UserLayout>} />
          <Route path="/auth" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <Auth /> </UserLayout>} />
          <Route path="/blog" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <Blog /> </UserLayout>} />
          <Route path="/gallery" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <Gallery/> </UserLayout>} />
          <Route path="/blog/:id" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <BlogDetail /> </UserLayout>} />

          <Route path="/reservations" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <Reservation /> </UserLayout> } />
          <Route path="/profile" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <Profile /> </UserLayout> } />
        
         <Route path="/termss" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <Terms /> </UserLayout> } />
          <Route path="/privacy" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <Privacy /> </UserLayout> } />
          <Route path="/faq" element={<UserLayout showRatingModal={showRating} onRatingClose={handleRatingClose}> <FAQ /> </UserLayout> } />

          {/* ADMIN ROUTES */}
          <Route path="/admin/*" element={<AppRoutes />} />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;