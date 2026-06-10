import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Legal.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      q: "What is the policy for the Ambrosia Onyx Fellowship?",
      a: "The Onyx Fellowship is our ultra-exclusive, invitation-only tier. Entry is granted based on community nominations or direct review by our internal advisory board. Members unlock keyless biometric access to the private vaults, priority reservations, exclusive events, and personalized service."
    },
    {
      q: "Can I book the entire lounge for a high-profile corporate event?",
      a: "Yes! Ambrosia offers complete architectural buyouts for business tycoons and elite private gatherings. We recommend contacting our private relationship concierge at least 14 days in advance to secure your preferred date and discuss custom packages."
    },
    {
      q: "Is there a strict smart dress code enforced every day?",
      a: "Absolutely. To preserve our premium luxury ecosystem, smart tailored attire is non-negotiable. Guests dressed in casual activewear, shorts, or flip-flops will be politely redirected by our front desk. Smart Elegant dress code applies at all times."
    },
    {
      q: "Are the liquid masterclasses available on a walk-in basis?",
      a: "No. Our Sommelier Masterclasses require highly curated ingredients and rare spirits. These slots must be booked exclusively through our platform's standalone booking system at least 24 hours prior to ensure availability and proper preparation."
    },
    {
      q: "What are your operating hours?",
      a: "Ambrosia Craft Lounge is open Tuesday through Sunday from 5:00 PM to 1:00 AM. We are closed on Mondays for deep cleaning and staff training. Last seating for food is at 11:00 PM, and last call for drinks is at 12:30 AM."
    },
    {
      q: "Do you offer vegetarian or vegan menu options?",
      a: "Yes! Our culinary team has crafted an extensive vegetarian and vegan menu that features the same premium quality and creativity as our non-vegetarian offerings. Please inform our staff of any dietary restrictions or allergies when making your reservation or ordering."
    },
    {
      q: "Is parking available at the lounge?",
      a: "We offer valet parking for all guests at a nominal fee. Self-parking is also available nearby at designated public parking areas. Please ask our staff for directions upon arrival."
    },
    {
      q: "Can I bring my own alcohol or food?",
      a: "Outside food and beverages are strictly prohibited. We offer a carefully curated selection of premium spirits, wines, craft cocktails, and gourmet cuisine for your enjoyment."
    },
    {
      q: "Do you accept reservations for large groups?",
      a: "Yes! We welcome large groups and private events. For groups of 10 or more, please contact our events team directly to discuss custom packages and availability."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards, debit cards, UPI, and cash. We do not accept personal checks. All prices are inclusive of applicable taxes, and a service charge may be added to your final bill."
    },
    {
      q: "Is the lounge wheelchair accessible?",
      a: "Absolutely! We are fully committed to accessibility. Our premises feature wheelchair ramps, accessible restrooms, and other accommodations to ensure all guests can enjoy their experience at Ambrosia."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="d_legal_wrapper d_bg_light">
      {/* Premium Header */}
      <div className="d_legal_header text-center">
        <span className="d_legal_tag">CONCIERGE DESK</span>
        <h1 className="d_legal_title">Frequently Asked</h1>
        <div className="d_legal_line mx-auto mt-3"></div>
      </div>

      <div className="container d_legal_content_container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-8">
            
            <div className="d_faq_accordion_container">
              {faqData.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div 
                    className={`d_glass_faq_item ${isOpen ? 'd_faq_active' : ''}`} 
                    key={idx}
                  >
                    <div 
                      className="d_faq_question_block d-flex align-items-center justify-content-between"
                      onClick={() => toggleFAQ(idx)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <FaQuestionCircle className="d_faq_q_icon" />
                        <h4 className="m-0">{item.q}</h4>
                      </div>
                      <div>
                        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>
                    
                    <div className={`d_faq_answer_block ${isOpen ? 'd_answer_show' : ''}`}>
                      <p className="m-0">{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
