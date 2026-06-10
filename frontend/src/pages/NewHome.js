import React, { useState } from 'react';
import {
  FaGlassMartiniAlt,
  FaUtensils,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaArrowRight,
  FaArrowDown,
  FaGem,
  FaCrown,
  FaShieldAlt,
  FaChevronDown,
  FaChevronUp,
  FaLeaf,
  FaMedal,
  FaWineGlass,
  FaFire,
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';

const NewHome = () => {
  const [activeTab, setActiveTab] = useState('mixology');
  const [openAma, setOpenAma] = useState(null);

  const menuItems = {
    mixology: [
      { id: "01", name: "The Nebula Elixir", price: "₹1,250", badge: "SIGNATURE", desc: "Premium single malt infused with 24k gold leaf, house saffron reduction, and cold-smoked hickory wood." },
      { id: "02", name: "Smoked Velvet Negroni", price: "₹950", badge: "CHEF'S PICK", desc: "Artisanal dry gin, bespoke vermouth blend, campari, trapped under a crystal smoke dome." },
      { id: "03", name: "Midnight Orchid Mist", price: "₹850", badge: null, desc: "White rum, natural blue pea flower extract, elderflower liqueur, topped with molecular citrus foam." }
    ],
    culinary: [
      { id: "04", name: "Truffle Glazed Lamb Chops", price: "₹1,850", badge: "SIGNATURE", desc: "Slow-roasted premium lamb chops glazed with wild Italian black truffle oil reduction and micro-herbs." },
      { id: "05", name: "Imperial Sturgeon Caviar", price: "₹2,400", badge: "RARE", desc: "Imported caviar served over crispy gold-dusted artisanal potato blinis with chive creme fraiche." },
      { id: "06", name: "A5 Wagyu Gold Sliders", price: "₹1,650", badge: "CHEF'S PICK", desc: "A5 Wagyu beef slices with melted aged cheddar and edible gold leaf garnish in rich brioche." }
    ]
  };

  const amaData = [
    { q: "What is the dress code at Ambrosia?", a: "Ambrosia enforces a strict ultra-premium smart elegant dress code. Guests are expected to arrive in formal or high-end evening wear. Casual attire, open footwear, or sportswear will not be permitted entry. Our concierge team is available to clarify specifics prior to your visit." },
    { q: "Is Ambrosia exclusively members-only?", a: "Our main lounge and Imperial Dining hall are open to walk-in reservation guests. However, The Eclipse VIP Vault is exclusively available to verified platinum members and invited corporate guests. Membership applications are reviewed on a quarterly basis." },
    { q: "Can the menu be curated for dietary restrictions?", a: "Absolutely. Our culinary atelier accommodates vegan, gluten-intolerant, Jain, and allergen-specific requirements. We request that dietary needs be disclosed at the time of reservation to allow our kitchen to prepare accordingly without compromising the presentation standards." },
    { q: "How far in advance must reservations be made?", a: "For standard lounge seating, a 48-hour advance booking is strongly recommended. For private vault experiences, corporate events, or full dining table curation, a minimum of 7 days notice is required. Last-minute availability is limited and subject to premium handling fees." },
    { q: "Are private events and corporate evenings possible?", a: "Yes. Ambrosia hosts exclusive corporate dinners, brand collaboration evenings, and high-profile private celebrations. Our events team offers end-to-end planning: custom menu design, curated cocktail pairings, AV setups, and branded experiences tailored to your brief." }
  ];

  return (
    <div className="d_luxury_app">

      {/* ── HERO (dark – full bleed image) ── */}
      <section id="home" className="d_hero_wrapper">
        <div className="d_hero_image_bg" />
        <div className="d_hero_dimmer" />
        <div className="d_hero_side_tag d-none d-lg-flex">SURAT · INDIA · 2026</div>

        <div className="container d_hero_inner text-center">
          <div className="d_hero_eyebrow_row">
            <span className="d_hero_dash" />
            <span className="d_hero_eyebrow">ESTABLISHED 2026</span>
            <span className="d_hero_dash" />
          </div>

          <h1 className="d_hero_main_title">
            WHERE REFINEMENT<br />
            <em className="d_hero_em">MEETS</em><br />
            MASTER MIXOLOGY
          </h1>

          <p className="d_hero_paragraph mx-auto">
            Surat's premiere high-end lounge destination for true connoisseurs. Experience bespoke craft spirits and Michelin-grade culinary curation in an architectural masterpiece.
          </p>

          <div className="d_hero_cta_row">
            <a href="#menu" className="d_cta_gold">EXPLORE THE MENU <FaArrowRight className="ms-2" /></a>
            <a href="#reserve" className="d_cta_ghost">BOOK PRIVATE VAULT</a>
          </div>

          <div className="d_hero_stat_row">
            <div className="d_hero_stat"><span className="d_stat_num">200+</span><span className="d_stat_label">Rare Spirits</span></div>
            <div className="d_hero_stat_divider" />
            <div className="d_hero_stat"><span className="d_stat_num">18</span><span className="d_stat_label">Signature Cocktails</span></div>
            <div className="d_hero_stat_divider" />
            <div className="d_hero_stat"><span className="d_stat_num">7★</span><span className="d_stat_label">Service Standard</span></div>
          </div>
        </div>

        <div className="d_hero_scroll_hint">
          <p>SCROLL</p>
          <FaArrowDown className="d_arrow_bounce" />
        </div>
      </section>

      {/* ── UTILITY STRIP (light) ── */}
      <section className="d_grid_utility_strip d_bg_light">
        <div className="container">
          <div className="row g-0 justify-content-center">
            <div className="col-12 col-md-4">
              <div className="d_utility_grid_box">
                <FaMapMarkerAlt className="d_utility_grid_icon" />
                <div><h6>LOCATION</h6><p>Luxury Skyline Hub, Level 7, Surat</p></div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="d_utility_grid_box d_box_middle_border">
                <FaClock className="d_utility_grid_icon" />
                <div><h6>HOURS</h6><p>Daily: 05:00 PM — 02:00 AM</p></div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="d_utility_grid_box">
                <FaPhoneAlt className="d_utility_grid_icon" />
                <div><h6>RESERVATIONS</h6><p>+91 99999 88888</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HERITAGE (dark) ── */}
      <section id="heritage" className="d_section_master d_bg_dark">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <span className="d_section_tag">THE IDENTITY</span>
              <h2 className="d_section_heading_dark my-3">Bespoke Ambience,<br/>Unrivaled Standards</h2>
              <div className="d_accent_line mb-4" />
              <p className="d_para_on_dark mb-4">Ambrosia is crafted as a sensory sanctuary for the elite. We reject the ordinary, choosing instead to blend rare international spirits with cutting-edge molecular gastronomy.</p>
              <p className="d_para_on_dark mb-5">Every corner is architecturally aligned to evoke premium sophistication, creating the ultimate backdrop for your exclusive late-night gatherings.</p>
              <div className="d_badge_row">
                <span className="d_badge_pill_dark"><FaMedal className="me-2" />Award Winning Bar</span>
                <span className="d_badge_pill_dark"><FaLeaf className="me-2" />Sustainably Sourced</span>
                <span className="d_badge_pill_dark"><FaWineGlass className="me-2" />200+ Curations</span>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="d_img_frame_dark">
                <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80" alt="Lounge Decor" className="d_luxury_img" />
                <div className="d_img_caption">THE ALCHEMY BAR</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GOURMET ATELIER (light) ── */}
      <section id="atelier" className="d_section_master d_bg_light">
        <div className="container">
          <div className="row align-items-center g-5 flex-column-reverse flex-lg-row">
            <div className="col-12 col-lg-6">
              <div className="d_img_frame_light">
                <img src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=900&q=80" alt="Masterchef Curation" className="d_luxury_img" />
                <div className="d_img_caption_light">GOURMET ATELIER</div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <span className="d_section_tag">GOURMET ATELIER</span>
              <h2 className="d_section_heading_light my-3">Michelin-Inspired<br/>Gastronomy Curation</h2>
              <div className="d_accent_line mb-4" />
              <p className="d_para_on_light mb-4">Our culinary laboratory is headed by world-renowned taste designers. Food is treated not as a meal but as architectural art on a plate — using global sourcing networks and seasonal provenance.</p>
              <div className="row g-3 pt-2">
                {[
                  { icon: <FaCrown/>, title: "A5 Wagyu Grading", sub: "Imported from Kagoshima, Japan" },
                  { icon: <FaGem/>, title: "Fresh Truffle Influx", sub: "Weekly air-freight, Périgord France" },
                  { icon: <FaFire/>, title: "Live Flambe Stations", sub: "Theatrical tableside preparations" },
                  { icon: <FaLeaf/>, title: "Seasonal Micro-Herbs", sub: "Grown in-house, controlled conditions" }
                ].map((f, i) => (
                  <div className="col-6" key={i}>
                    <div className="d_feature_card_light">
                      <span className="d_feature_icon">{f.icon}</span>
                      <div><h6>{f.title}</h6><p>{f.sub}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPACES (dark) ── */}
      <section id="spaces" className="d_section_master d_bg_dark">
        <div className="container">
          <div className="text-center mb-5">
            <span className="d_section_tag">THE ARCHITECTURE</span>
            <h2 className="d_section_heading_dark mt-2">Bespoke Spaces For The Elite</h2>
            <div className="d_accent_line mx-auto mt-3" />
          </div>
          <div className="row g-4 justify-content-center">
            {[
              { icon: <FaGlassMartiniAlt/>, title: "The Alchemy Bar", desc: "A continuous monolith marble counter where world-class mixologists craft tailored liquid profiles to match your taste palette." },
              { icon: <FaUtensils/>, title: "Imperial Dining", desc: "An intimate, low-lit environment featuring structured long-tables reserved strictly for multi-course tasting menus.", featured: true },
              { icon: <FaCalendarAlt/>, title: "Eclipse VIP Vault", desc: "A completely soundproof, biometric-access reservation lounge designed for high-profile business tycoons." }
            ].map((s, i) => (
              <div className="col-12 col-md-6 col-lg-4" key={i}>
                <div className={`d_space_card ${s.featured ? 'd_space_featured' : ''}`}>
                  {s.featured && <div className="d_featured_ribbon">FEATURED</div>}
                  <div className="d_space_icon">{s.icon}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                  <a href="#reserve" className="d_space_link">Reserve <FaArrowRight /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MENU (light) ── */}
      <section id="menu" className="d_section_master d_bg_light">
        <div className="container">
          <div className="text-center mb-5">
            <span className="d_section_tag">FINE CURATIONS</span>
            <h2 className="d_section_heading_light mt-2">The Signature Vault Menu</h2>
            <div className="d_accent_line mx-auto mt-3 mb-4" />
            <div className="d_tab_wrapper">
              <button className={`d_tab_btn ${activeTab === 'mixology' ? 'd_tab_active' : ''}`} onClick={() => setActiveTab('mixology')}>
                <FaWineGlass className="me-2" />LIQUID ALCHEMY
              </button>
              <button className={`d_tab_btn ${activeTab === 'culinary' ? 'd_tab_active' : ''}`} onClick={() => setActiveTab('culinary')}>
                <FaUtensils className="me-2" />GOURMET GASTRONOMY
              </button>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
              {menuItems[activeTab].map((item) => (
                <div className="d_menu_row_light" key={item.id}>
                  <div className="d_menu_row_inner">
                    <span className="d_menu_num">{item.id}</span>
                    <div className="d_menu_body">
                      <div className="d_menu_title_row">
                        <h4 className="d_menu_name">{item.name}</h4>
                        {item.badge && <span className="d_menu_badge_light">{item.badge}</span>}
                      </div>
                      <p className="d_menu_desc_light">{item.desc}</p>
                    </div>
                    <span className="d_menu_price_light">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY (dark) ── */}
      <section id="library" className="d_section_master d_bg_dark">
        <div className="container">
          <div className="text-center mb-5">
            <span className="d_section_tag">THE REPERTOIRE</span>
            <h2 className="d_section_heading_dark mt-2">The Vault Liquid Collectibles</h2>
            <div className="d_accent_line mx-auto mt-3" />
          </div>
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div className="d_gallery_box d_gallery_tall">
                <img src="https://i.pinimg.com/736x/5c/ad/63/5cad633e97d65d4d45bfe795b7eeef62.jpg" alt="Whiskey" />
                <div className="d_gallery_overlay"><h6>Bespoke Single Malts</h6><p>Over 40 distilleries represented</p></div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="row g-3">
                {[
                  { src: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=500&q=80", title: "Artisanal Botanicals", sub: "Gin library, 30+ labels" },
                  { src: "https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=500&q=80", title: "Vintage Cellar Reserves", sub: "Temperature-controlled collection" },
                  { src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=500&q=80", title: "Crystal Brut Champagne", sub: "Dom Pérignon & Krug cuvées" }
                ].map((g, i) => (
                  <div className="col-12 col-sm-4 col-lg-12" key={i}>
                    <div className="d_gallery_box" style={{ height: '130px' }}>
                      <img src={g.src} alt={g.title} />
                      <div className="d_gallery_overlay"><h6>{g.title}</h6><p>{g.sub}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESERVATION (light) ── */}
      <section id="reserve" className="d_section_master d_bg_light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
              <div className="d_form_box_light">
                <div className="text-center mb-5">
                  <span className="d_section_tag">SECURE ENTRY</span>
                  <h2 className="d_section_heading_light mt-2">Request Table Allocation</h2>
                  <div className="d_accent_line mx-auto mt-3" />
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <div className="d_field">
                        <label className="d_field_label">FULL NAME</label>
                        <input type="text" className="d_input_light" placeholder="e.g., Devendra Shah" required />
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="d_field">
                        <label className="d_field_label">CONTACT NUMBER</label>
                        <input type="tel" className="d_input_light" placeholder="e.g., +91 98765 43210" required />
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="d_field">
                        <label className="d_field_label">GUEST COUNT</label>
                        <select className="d_input_light">
                          <option>1 — 2 Persons</option>
                          <option>3 — 5 Persons</option>
                          <option>Private Vault Experience (5+)</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="d_field">
                        <label className="d_field_label">RESERVATION DATE</label>
                        <input type="date" className="d_input_light" required />
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="d_field">
                        <label className="d_field_label">PREFERRED TIME</label>
                        <select className="d_input_light">
                          <option>06:00 PM — 09:00 PM</option>
                          <option>09:00 PM — 12:00 AM</option>
                          <option>12:00 AM — 02:00 AM</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-12 text-center mt-2">
                      <div className="d_security_note mb-4">
                        <FaShieldAlt className="me-2" />
                        <span>All bookings are subject to ultra-premium smart elegant dress code rules.</span>
                      </div>
                      <button type="submit" className="d_btn_gold w-100">SUBMIT ALLOCATION REQUEST</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GUEST LOGS (dark) ── */}
      <section className="d_section_master d_bg_dark">
        <div className="container">
          <div className="text-center mb-5">
            <span className="d_section_tag">THE JOURNAL</span>
            <h2 className="d_section_heading_dark mt-2">Verified Guest Logs</h2>
            <div className="d_accent_line mx-auto mt-3" />
          </div>
          <div className="row g-4">
            {[
              { name: "Rohan Singhania", role: "Managing Director, VCC", text: "The pure architectural symmetry and strict layout line alignments are visual therapy. The Nebula Elixir cocktail is genuinely world-class." },
              { name: "Pooja Adani", role: "Luxury Property Consultant", text: "Absolute high-end privacy. The biometric VIP vaults offer true premium separation. The Michelin-grade lamb chops perfectly melted in every bite." }
            ].map((r, i) => (
              <div className="col-12 col-lg-6" key={i}>
                <div className="d_review_card">
                  <div className="d_stars mb-3">{[...Array(5)].map((_, j) => <FaStar key={j} />)}</div>
                  <p className="d_review_text">"{r.text}"</p>
                  <div className="d_review_meta">
                    <div className="d_review_avatar">{r.name[0]}</div>
                    <div><h5>{r.name}</h5><span>{r.role}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AMA (light) ── */}
      <section id="ama" className="d_section_master d_bg_light">
        <div className="container">
          <div className="text-center mb-5">
            <span className="d_section_tag">ASK AMBROSIA</span>
            <h2 className="d_section_heading_light mt-2">Everything You Need to Know</h2>
            <div className="d_accent_line mx-auto mt-3 mb-3" />
            <p className="d_para_on_light mx-auto" style={{ maxWidth: '520px' }}>From dress code to private vault bookings — answers curated for our discerning guests.</p>
          </div>

          <div className="row justify-content-center">
            <div className="col-12 col-xl-9">
              <div className="d_ama_list_light">
                {amaData.map((item, i) => (
                  <div className={`d_ama_item_light ${openAma === i ? 'd_ama_open' : ''}`} key={i}>
                    <button className="d_ama_q_light" onClick={() => setOpenAma(openAma === i ? null : i)}>
                      <span>{item.q}</span>
                      <span className="d_ama_chevron">{openAma === i ? <FaChevronUp /> : <FaChevronDown />}</span>
                    </button>
                    <div className={`d_ama_ans_wrap ${openAma === i ? 'd_ama_ans_open' : ''}`}>
                      <p className="d_ama_ans_light">{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-5">
                <p className="d_para_on_light mb-3">Still have questions? Our concierge team is available exclusively for elite guests.</p>
                <a href="tel:+919999988888" className="d_btn_gold_outline">
                  <FaPhoneAlt className="me-2" />CALL CONCIERGE
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default NewHome;