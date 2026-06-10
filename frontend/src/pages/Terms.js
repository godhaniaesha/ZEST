import React from 'react';
import { 
  FaUserCheck, 
  FaShieldAlt, 
  FaGavel, 
  FaRegFileAlt, 
  FaWineGlassAlt, 
  FaCreditCard, 
  FaCamera, 
  FaExclamationTriangle, 
  FaMobileAlt,
  FaUtensils
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Legal.css';

const Terms = () => {
  return (
    <div className="d_legal_wrapper d_bg_light">
      {/* Premium Header */}
      <div className="d_legal_header text-center">
        <span className="d_legal_tag">LEGAL FRAMEWORK</span>
        <h1 className="d_legal_title">Terms of Service</h1>
        <div className="d_legal_line mx-auto mt-3"></div>
        <p className="d_legal_subtitle mt-3">Last Updated: June 2026</p>
      </div>

      <div className="container d_legal_content_container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-9">
            
            <div className="d_legal_card">
              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaUserCheck className="d_legal_sec_icon" />
                  <h2>1. Club Admission & Dress Code</h2>
                </div>
                <p>
                  Ambrosia Craft Lounge reserves the absolute right of admission. Guests must strictly adhere to our **Smart Elegant** dress code standard. Casual sportswear, slippers, and beachwear are strictly prohibited within the main vault premises.
                </p>
                <ul>
                  <li>Men: Tailored trousers, collared shirts, closed-toe shoes</li>
                  <li>Women: Elegant dresses, tailored separates, or formal evening wear</li>
                  <li>Management reserves the right to refuse entry to any guest not meeting the dress code</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaShieldAlt className="d_legal_sec_icon" />
                  <h2>2. Reservations & Allocations</h2>
                </div>
                <p>
                  Table reservations are held for a maximum of 15 minutes past the requested slot. Private biometric vault bookings require a non-refundable verification deposit which will be adjusted against the final premium curation bill.
                </p>
                <ul>
                  <li>Standard table reservations require a valid contact number and email</li>
                  <li>VIP Vault bookings require 50% advance payment</li>
                  <li>Same-day cancellations may incur a nominal fee</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaWineGlassAlt className="d_legal_sec_icon" />
                  <h2>3. Beverage & Alcohol Policy</h2>
                </div>
                <p>
                  We serve premium spirits, wines, and craft cocktails. All guests must be of legal drinking age (21+ in India). We reserve the right to refuse service to any intoxicated guest.
                </p>
                <ul>
                  <li>Valid government-issued photo ID is mandatory for all guests</li>
                  <li>Outside food and beverages are strictly prohibited</li>
                  <li>We promote responsible drinking</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaUtensils className="d_legal_sec_icon" />
                  <h2>4. Food & Allergies</h2>
                </div>
                <p>
                  Our culinary team prepares premium, Michelin-grade cuisine. Please inform our staff of any allergies, dietary restrictions, or religious requirements before placing your order.
                </p>
                <ul>
                  <li>Vegetarian, vegan, and gluten-free options are available on request</li>
                  <li>We cannot guarantee a completely allergen-free environment</li>
                  <li>Consuming raw or undercooked meats, poultry, seafood, or eggs may increase your risk of foodborne illness</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaCreditCard className="d_legal_sec_icon" />
                  <h2>5. Payment & Billing</h2>
                </div>
                <p>
                  We accept all major credit cards, debit cards, UPI, and cash. All prices are inclusive of applicable taxes. A service charge may be added to the final bill.
                </p>
                <ul>
                  <li>Splitting bills is allowed at the discretion of management</li>
                  <li>We are not responsible for lost or stolen personal items</li>
                  <li>All charges must be settled before leaving the premises</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaGavel className="d_legal_sec_icon" />
                  <h2>6. Code of Conduct</h2>
                </div>
                <p>
                  We promote an elite, private, and sensory experience. Any disruptive behavior that impacts the comfort or privacy of other high-profile guests will result in immediate removal by security and potential blacklisting from the Onyx Fellowship.
                </p>
                <ul>
                  <li>Respectful behavior towards staff and fellow guests is mandatory</li>
                  <li>Smoking is only permitted in designated areas</li>
                  <li>Violence, harassment, or any illegal activity will not be tolerated</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaCamera className="d_legal_sec_icon" />
                  <h2>7. Photography & Social Media</h2>
                </div>
                <p>
                  Photography is allowed in most areas, but we request discretion to respect the privacy of other guests. Flash photography is prohibited.
                </p>
                <ul>
                  <li>Tag us @AmbrosiaLounge on social media!</li>
                  <li>Professional photography or videography requires prior approval</li>
                  <li>We may take photos or videos for marketing purposes</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaMobileAlt className="d_legal_sec_icon" />
                  <h2>8. Membership & Loyalty Program</h2>
                </div>
                <p>
                  Our Onyx Fellowship is an exclusive, invitation-only program. Membership benefits and terms are subject to change at any time without prior notice.
                </p>
                <ul>
                  <li>Membership is personal and non-transferable</li>
                  <li>We reserve the right to revoke membership at any time</li>
                  <li>Members must adhere to all club policies</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaExclamationTriangle className="d_legal_sec_icon" />
                  <h2>9. Liability & Disclaimer</h2>
                </div>
                <p>
                  Ambrosia Craft Lounge is not responsible for any personal injury, loss, or damage to personal property that occurs on our premises.
                </p>
                <ul>
                  <li>Please supervise your personal belongings at all times</li>
                  <li>We are not liable for any accidents or incidents</li>
                  <li>Use of our facilities is at your own risk</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaRegFileAlt className="d_legal_sec_icon" />
                  <h2>10. Governing Law</h2>
                </div>
                <p>
                  These luxury alliance terms are governed by and construed in accordance with the laws of India, under the strict jurisdiction of the courts located in Surat, Gujarat.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
