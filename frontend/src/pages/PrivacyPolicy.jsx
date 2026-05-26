import React from 'react';
import { Shield, Lock, Eye, FileText, Mail } from 'lucide-react';
import '../styles/x_pages.css';

const PrivacyPolicy = () => {
  const lastUpdated = 'May 2024';

  const policyTopics = [
    {
      id: 'intro',
      icon: <Shield size={24} />,
      title: 'Our Commitment',
      content:
        "Zest Cafe & Bar ('we' or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and interact with our business.",
    },
    {
      id: 'collection',
      icon: <Eye size={24} />,
      title: 'Information We Collect',
      content: `We may collect information about you in a variety of ways:
      
      • Personal Data: Name, email address, phone number, mailing address, payment information
      • Reservation Data: Date, time, party size, dietary preferences, special requests
      • Usage Data: Browser type, IP address, pages visited, time spent on site
      • Cookies: Small files stored on your device to enhance your experience
      • Feedback: Reviews, comments, and suggestions about our services`,
    },
    {
      id: 'usage',
      icon: <FileText size={24} />,
      title: 'How We Use Your Information',
      content: `We use the information we collect for various purposes:
      
      • Process and fulfill your reservations and orders
      • Send you updates about your reservation or order
      • Provide customer service and respond to inquiries
      • Improve our website, products, and services
      • Comply with legal and regulatory obligations
      • Prevent fraudulent transactions
      • Send promotional materials (with your consent)`,
    },
    {
      id: 'sharing',
      icon: <Lock size={24} />,
      title: 'How We Protect Your Data',
      content: `We implement appropriate technical and organizational measures to protect your personal data:
      
      • SSL/TLS encryption for data transmission
      • Secure payment processing through trusted providers
      • Limited access to personal data (employees only when necessary)
      • Regular security audits and updates
      • Confidentiality agreements with service providers
      
      However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.`,
    },
    {
      id: 'rights',
      icon: <Mail size={24} />,
      title: 'Your Rights',
      content: `Depending on your location, you may have certain rights regarding your personal data:
      
      • Right to access: Request a copy of your data
      • Right to rectification: Correct inaccurate information
      • Right to erasure: Request deletion of your data
      • Right to restrict processing: Limit how we use your data
      • Right to data portability: Receive data in a portable format
      
      To exercise these rights, please contact us at privacy@zestcafe.com`,
    },
  ];

  const sections = [
    {
      title: '1. Introduction',
      content:
        'This Privacy Policy applies to all visitors and users of our website, as well as customers who dine at our establishment or interact with us through other channels. By accessing our website or engaging with our business, you agree to the terms of this Privacy Policy.',
    },
    {
      title: '2. Information Collection & Use',
      content:
        'We collect information necessary to provide you with our services. This includes reservation details, contact information, payment data, and preferences. We use this information to process your requests, improve our services, and communicate with you about your experience.',
    },
    {
      title: '3. Cookies & Tracking',
      content:
        'Our website uses cookies to enhance your browsing experience. Cookies help us remember your preferences and improve site functionality. You can disable cookies in your browser settings, though some features may not work optimally.',
    },
    {
      title: '4. Third-Party Services',
      content:
        'We use trusted third-party services for payment processing, analytics, and marketing. These service providers are contractually obligated to protect your data and use it only for the purposes we specify.',
    },
    {
      title: '5. Data Retention',
      content:
        'We retain your personal data only as long as necessary to provide services, fulfill legal obligations, or resolve disputes. Once no longer needed, we securely delete or anonymize your data.',
    },
    {
      title: '6. Children\'s Privacy',
      content:
        'Our website is not directed to children under 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with information, we will promptly delete such data.',
    },
    {
      title: '7. International Data Transfers',
      content:
        'If you are located outside the United States, your information may be transferred to and processed in the United States. By using our services, you consent to such transfers.',
    },
    {
      title: '8. Contact Us',
      content:
        'If you have questions about this Privacy Policy or our privacy practices, please contact us at privacy@zestcafe.com or call +1 (555) 123-4567.',
    },
  ];

  return (
    <main className="x_privacy_page">
      <div className="x_privacy_glow x_privacy_glow_one" />
      <div className="x_privacy_glow x_privacy_glow_two" />

      {/* Hero Section */}
      <section className="x_privacy_hero container">
        <div className="x_privacy_hero_content">
          <span className="x_privacy_eyebrow">
            <Shield size={16} />
            Privacy Matters
          </span>
          <h1 className="x_privacy_headline">Your Privacy is Important to Us</h1>
          <p>
            We believe in transparency and protecting your personal information. Read our complete
            privacy policy to understand how we collect, use, and protect your data.
          </p>
          <div className="x_privacy_last_updated">
            Last updated: <strong>{lastUpdated}</strong>
          </div>
        </div>
      </section>

      {/* Key Topics */}
      {/* <section className="x_privacy_topics container">
        <div className="x_privacy_topics_grid">
          {policyTopics.map((topic) => (
            <div className="x_privacy_topic_card" key={topic.id}>
              <div className="x_privacy_topic_icon">{topic.icon}</div>
              <h3>{topic.title}</h3>
              <p>{topic.content}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Detailed Policy */}
      <section className="x_privacy_details container">
        {/* <div className="x_privacy_details_header">
          <h2>Complete Privacy Policy</h2>
          <p>Full terms and conditions regarding your data</p>
        </div> */}

        <div className="x_privacy_content">
          {sections.map((section, idx) => (
            <div className="x_privacy_section" key={idx}>
              <h3>{section.title}</h3>
              <p>{section.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="x_privacy_faq">
        <div className="x_privacy_faq_header container">
          <h2>Privacy FAQs</h2>
          <p>Common questions about our privacy practices</p>
        </div>

        <div className="x_privacy_faq_grid container">
          <div className="x_privacy_faq_item">
            <h4>How long do you keep my data?</h4>
            <p>
              We retain reservation data for 6 months after your visit. Account information is kept
              as long as your account is active. We permanently delete data when no longer needed.
            </p>
          </div>

          <div className="x_privacy_faq_item">
            <h4>Can I opt out of marketing emails?</h4>
            <p>
              Yes! All marketing emails include an unsubscribe link. You can also contact us
              directly to manage your preferences.
            </p>
          </div>

          <div className="x_privacy_faq_item">
            <h4>Do you share my data with others?</h4>
            <p>
              We only share data with service providers who help us deliver our services, and only
              when they've agreed to protect your privacy.
            </p>
          </div>

          <div className="x_privacy_faq_item">
            <h4>How do I request my data?</h4>
            <p>
              Email privacy@zestcafe.com with your request. We'll provide your data within 30
              days, at no cost to you.
            </p>
          </div>

          <div className="x_privacy_faq_item">
            <h4>Is my payment information safe?</h4>
            <p>
              Yes. We use industry-standard SSL encryption and PCI-DSS compliant payment processors
              to protect your payment data.
            </p>
          </div>

          <div className="x_privacy_faq_item">
            <h4>What if I have privacy concerns?</h4>
            <p>
              Contact us immediately at privacy@zestcafe.com. We take all concerns seriously and
              respond promptly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact & Support */}
   <section className="x_privacy_contact container">
  <div className="x_privacy_contact_box">
    <h2>Need Help or Have Questions?</h2>

    <p>
      If you have any questions, feedback, or need assistance regarding our services,
      our support team is always ready to help you.
    </p>

    <div className="x_privacy_contact_options">
      <div className="x_privacy_contact_option">
        <Mail size={24} />
        <div>
          <strong>Customer Support</strong>
          <p>Get quick assistance for your queries and concerns.</p>
        </div>
      </div>

      <div className="x_privacy_contact_option">
        <Lock size={24} />
        <div>
          <strong>Secure Assistance</strong>
          <p>Your information and communication are always kept protected.</p>
        </div>
      </div>
    </div>

    <a href="/contactus" className="x_privacy_contact_btn">
      Contact Us
    </a>
  </div>
</section>
      {/* Policy Changes */}
      {/* <section className="x_privacy_changes container">
        <h3>Policy Updates</h3>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices,
          technology, legal requirements, or other factors. We will notify you of any material
          changes by posting the updated policy here with a new "Last Updated" date. Your continued
          use of our website or services after changes constitutes your acceptance of the updated
          Privacy Policy.
        </p>
      </section> */}
    </main>
  );
};

export default PrivacyPolicy;
