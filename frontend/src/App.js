import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import { ratingsAPI } from './api';

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
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';

const RATING_POLL_INTERVAL_MS = 10000;
const RATING_CANCEL_SNOOZE_MS = 60000;
const RESERVATION_COMPLETED_EVENT = 'reservation-rating:completed';

function UserLayout({ children }) {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [pendingReservation, setPendingReservation] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const snoozeUntilRef = useRef(0);
  const reopenTimerRef = useRef(null);

  useEffect(() => {
    if (loading || !user) {
      setPendingReservation(null);
      setShowRatingModal(false);
      return undefined;
    }

    let active = true;

    const checkPendingReservationRating = async () => {
      try {
        const response = await ratingsAPI.getPendingReservationRating();
        if (!active) return;

        const reservation = response.data?.reservation || null;
        setPendingReservation(reservation);
        if (Date.now() >= snoozeUntilRef.current) {
          setShowRatingModal(Boolean(reservation));
        }
      } catch (error) {
        if (!active) return;
        console.error('Error checking pending reservation rating:', error);
      }
    };

    checkPendingReservationRating();
    window.addEventListener(RESERVATION_COMPLETED_EVENT, checkPendingReservationRating);
    const intervalId = setInterval(checkPendingReservationRating, RATING_POLL_INTERVAL_MS);

    return () => {
      active = false;
      window.removeEventListener(RESERVATION_COMPLETED_EVENT, checkPendingReservationRating);
      clearInterval(intervalId);
      clearTimeout(reopenTimerRef.current);
    };
  }, [loading, user]);

  const handleRatingClose = () => {
    setShowRatingModal(false);
    if (pendingReservation) {
      snoozeUntilRef.current = Date.now() + RATING_CANCEL_SNOOZE_MS;
      clearTimeout(reopenTimerRef.current);
      reopenTimerRef.current = setTimeout(() => {
        setShowRatingModal(true);
      }, RATING_CANCEL_SNOOZE_MS);
    }
  };

  const handleRatingSubmit = async ({ rating, review }) => {
    if (!pendingReservation?._id) return;

    try {
      await ratingsAPI.submitReservation({
        reservationId: pendingReservation._id,
        rating,
        review,
      });
    } catch (error) {
      if (error.response?.status !== 409) {
        throw error;
      }
    } finally {
      setPendingReservation(null);
      setShowRatingModal(false);
      clearTimeout(reopenTimerRef.current);
    }
  };

  return (
    <>
      <Navbar />

      <main className="x_main_content">
        {children}
      </main>

      <Footer />

      {location.pathname !== "/profile" && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={handleRatingClose}
          onSubmit={handleRatingSubmit}
          cafeOrBarName="ZEST Cafe & Bar"
          reservation={pendingReservation}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* USER ROUTES */}
          <Route path="/" element={<UserLayout> <Home /> </UserLayout>} />
          <Route path="/home" element={<UserLayout> <Home /> </UserLayout>} />
          <Route path="/cbhome" element={<UserLayout> <BarCafeHome /> </UserLayout>} />
          <Route path="/newhome" element={<UserLayout> <NewHome /> </UserLayout>} />
          <Route path="/aboutus" element={<UserLayout> <AboutUs /> </UserLayout>} />
          <Route path="/contactus" element={<UserLayout> <ContactUs /> </UserLayout>} />
          <Route path="/services" element={<UserLayout> <Services /> </UserLayout>} />
          <Route path="/privacy-policy" element={<UserLayout> <PrivacyPolicy /> </UserLayout>} />
          <Route path="/terms" element={<UserLayout> <TermsAndConditions /> </UserLayout>} />
          <Route path="/menu" element={<UserLayout> <Menu /> </UserLayout>} />
          <Route path="/menu/:id" element={<UserLayout> <MenuDetail /> </UserLayout>} />
          <Route path="/auth" element={<UserLayout> <Auth /> </UserLayout>} />
          <Route path="/blog" element={<UserLayout> <Blog /> </UserLayout>} />
          <Route path="/gallery" element={<UserLayout> <Gallery/> </UserLayout>} />
          <Route path="/blog/:id" element={<UserLayout> <BlogDetail /> </UserLayout>} />

          <Route path="/reservations" element={<UserLayout> <Reservation /> </UserLayout> } />
          <Route path="/profile" element={<UserLayout> <Profile /> </UserLayout> } />
        
         <Route path="/termss" element={<UserLayout> <Terms /> </UserLayout> } />
          <Route path="/privacy" element={<UserLayout> <Privacy /> </UserLayout> } />
          <Route path="/faq" element={<UserLayout> <FAQ /> </UserLayout> } />

          {/* ADMIN ROUTES */}
          <Route path="/admin/*" element={<AppRoutes />} />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
