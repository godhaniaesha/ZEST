import React from 'react';
import { 
  FaLock, 
  FaEyeSlash, 
  FaDatabase, 
  FaUserShield,
  FaEnvelope,
  FaCookie,
  FaTrash,
  FaShieldVirus,
  FaExchangeAlt
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Legal.css';

const Privacy = () => {
  return (
    <div className="d_legal_wrapper d_bg_light">
      {/* Premium Header */}
      <div className="d_legal_header text-center">
        <span className="d_legal_tag">DATA PROTECTION</span>
        <h1 className="d_legal_title">Privacy Policy</h1>
        <div className="d_legal_line mx-auto mt-3"></div>
        <p className="d_legal_subtitle mt-3">Last Updated: June 2026</p>
      </div>

      <div className="container d_legal_content_container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-9">
            
            <div className="d_legal_card">
              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaLock className="d_legal_sec_icon" />
                  <h2>1. High-Tier Discretion</h2>
                </div>
                <p>
                  At Ambrosia, guest anonymity and data discretion are our highest priorities. Any details provided during membership requests or custom table allocations are strictly confidential and encrypted using enterprise-grade protocols.
                </p>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaDatabase className="d_legal_sec_icon" />
                  <h2>2. Information We Collect</h2>
                </div>
                <p>
                  We gather minimal identification matrix metrics to enhance your on-site experience. This includes:
                </p>
                <ul>
                  <li>Full name and verified contact information</li>
                  <li>Email address and phone number</li>
                  <li>Specific luxury preferences (such as culinary allergies or preferred single malt vintages)</li>
                  <li>Payment information (processed securely through our payment gateway)</li>
                  <li>Usage data and analytics</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaEnvelope className="d_legal_sec_icon" />
                  <h2>3. How We Use Your Information</h2>
                </div>
                <p>
                  We use your information for the following purposes:
                </p>
                <ul>
                  <li>To process and manage reservations and bookings</li>
                  <li>To provide personalized service and recommendations</li>
                  <li>To communicate important updates and offers</li>
                  <li>To improve our services and customer experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaEyeSlash className="d_legal_sec_icon" />
                  <h2>4. Zero Third-Party Sharing</h2>
                </div>
                <p>
                  We maintain a absolute zero-sharing policy. Your check-in history, choice of lounges, membership profile status, and billing summaries are never sold, shared, or exposed to any third-party marketing networks.
                </p>
                <ul>
                  <li>We may share data with trusted service providers who assist us in operating our business</li>
                  <li>We may disclose information when required by law or to protect our rights</li>
                  <li>Third-party service providers are bound by confidentiality agreements</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaCookie className="d_legal_sec_icon" />
                  <h2>5. Cookies & Tracking Technologies</h2>
                </div>
                <p>
                  We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are small files stored on your device that help us remember your preferences.
                </p>
                <ul>
                  <li>Essential cookies: Required for basic website functionality</li>
                  <li>Analytics cookies: Help us understand how our website is used</li>
                  <li>You can manage your cookie preferences through your browser settings</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaUserShield className="d_legal_sec_icon" />
                  <h2>6. Biometric & Vault Security</h2>
                </div>
                <p>
                  For spaces utilizing biometric identity scanning (such as the Eclipse VIP Vault), registration data is stored on localized offline secured hardware chips and is completely wiped upon termination of the membership cycle.
                </p>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaShieldVirus className="d_legal_sec_icon" />
                  <h2>7. Data Security Measures</h2>
                </div>
                <p>
                  We implement robust security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.
                </p>
                <ul>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure payment processing</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaExchangeAlt className="d_legal_sec_icon" />
                  <h2>8. Your Rights & Choices</h2>
                </div>
                <p>
                  You have certain rights regarding your personal information:
                </p>
                <ul>
                  <li>Access: Request a copy of your personal data</li>
                  <li>Correction: Update or correct your information</li>
                  <li>Deletion: Request deletion of your personal data</li>
                  <li>Opt-out: Unsubscribe from marketing communications</li>
                </ul>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaTrash className="d_legal_sec_icon" />
                  <h2>9. Data Retention</h2>
                </div>
                <p>
                  We retain your personal information only as long as necessary for the purposes for which it was collected, or as required by law. When we no longer need your information, we will securely delete or anonymize it.
                </p>
              </div>

              <div className="d_legal_section">
                <div className="d_legal_icon_title">
                  <FaUserShield className="d_legal_sec_icon" />
                  <h2>10. Changes to This Policy</h2>
                </div>
                <p>
                  We may update this privacy policy from time to time. Any changes will be posted on our website, and the revised policy will be effective immediately upon posting. We encourage you to review this policy periodically.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
