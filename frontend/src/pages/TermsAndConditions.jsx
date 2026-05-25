import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertCircle, Shield, Scale } from 'lucide-react';
import '../styles/x_pages.css';

const TermsAndConditions = () => {
    const [expandedSection, setExpandedSection] = useState(null);

    const lastUpdated = 'May 2024';

    const keyTerms = [
        {
            id: 'acceptance',
            icon: <CheckCircle2 size={24} />,
            title: 'Acceptance of Terms',
            content:
                'By accessing and using this website and Zest Cafe & Bar services, you accept and agree to be bound by the terms and provision of this agreement.',
        },
        {
            id: 'use-license',
            icon: <FileText size={24} />,
            title: 'License to Use',
            content:
                'Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.',
        },
        {
            id: 'restrictions',
            icon: <AlertCircle size={24} />,
            title: 'Use Restrictions',
            content:
                'You may not modify, copy, distribute, or transmit any content without prior written permission from Zest Cafe & Bar.',
        },
        {
            id: 'liability',
            icon: <Scale size={24} />,
            title: 'Limitation of Liability',
            content:
                'In no event shall Zest Cafe & Bar or its suppliers be liable for any damages arising out of the use of this website.',
        },
    ];

    const sections = [
        {
            id: 'agreement',
            title: '1. Agreement to Terms',
            content: `These Terms and Conditions constitute the entire agreement between you and Zest Cafe & Bar concerning the use of our services and website. If you do not agree to abide by these terms, please do not use this service.`,
        },
        {
            id: 'use-license',
            title: '2. Use License',
            content: `Permission is granted to view and download materials (including information or software) from Zest Cafe & Bar for personal, non-commercial use only. This is the grant of a license, not a transfer of title. Under this license you may not: modify the materials, use the materials for any commercial purpose or for any public display, attempt to decompile or reverse engineer any software contained on the website, remove any copyright or other proprietary notations, transfer the materials to another person or "mirror" the materials on any other server, or use the materials for any illegal purpose.`,
        },
        {
            id: 'disclaimer',
            title: '3. Disclaimer of Warranties',
            content: `The materials on Zest Cafe & Bar's website are provided on an 'as is' basis. Zest Cafe & Bar makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.`,
        },
        {
            id: 'limitations',
            title: '4. Limitations of Liability',
            content: `In no event shall Zest Cafe & Bar or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Zest Cafe & Bar's website, even if Zest Cafe & Bar or an authorized representative has been notified orally or in writing of the possibility of such damage.`,
        },
        {
            id: 'accuracy',
            title: '5. Accuracy of Materials',
            content: `The materials appearing on Zest Cafe & Bar's website could include technical, typographical, or photographic errors. Zest Cafe & Bar does not warrant that any of the materials on the website are accurate, complete, or current. Zest Cafe & Bar may make changes to the materials contained on its website at any time without notice.`,
        },
        {
            id: 'materials',
            title: '6. Materials License',
            content: `The materials on Zest Cafe & Bar's website are protected by copyright law and international copyright treaties. Zest Cafe & Bar grants you a non-exclusive, non-transferable license to access the materials on Zest Cafe & Bar's website for personal, non-commercial viewing only. This license does not include the right to download materials (other than page caching) unless specifically stated in this agreement.`,
        },
        {
            id: 'modifications',
            title: '7. Modifications',
            content: `Zest Cafe & Bar may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.`,
        },
        {
            id: 'governing',
            title: '8. Governing Law',
            content: `These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Zest Cafe & Bar operates, and you irrevocably submit to the exclusive jurisdiction of the courts located in that area.`,
        },
        {
            id: 'reservation',
            title: '9. Reservation Terms',
            content: `Reservations must be made 24 hours in advance. Cancellations must be made 12 hours prior to reservation time. Failure to cancel may result in a cancellation fee. We reserve the right to hold tables for 15 minutes past reservation time.`,
        },
        {
            id: 'conduct',
            title: '10. Code of Conduct',
            content: `Guests are expected to maintain appropriate behavior at all times. Zest Cafe & Bar reserves the right to refuse service to anyone whose conduct is disruptive or inappropriate. Harassment, discrimination, or illegal behavior will not be tolerated.`,
        },
    ];

    const toggleSection = (id) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    return (
        <main className="x_terms_page">
            <div className="x_terms_glow x_terms_glow_one" />
            <div className="x_terms_glow x_terms_glow_two" />

            {/* Hero Section */}
            <section className="x_terms_hero container">
                <div className="x_terms_hero_content">
                    <span className="x_terms_eyebrow">
                        <Shield size={16} />
                        Terms & Conditions
                    </span>
                    <h1 className="x_terms_headline">Our Terms, Your Rights, Clear Rules</h1>
                    <p>
                        Please read these Terms and Conditions carefully before using Zest Cafe & Bar services
                        and website. Your use of our services implies acceptance of these terms.
                    </p>
                    <div className="x_terms_last_updated">
                        Last updated: <strong>{lastUpdated}</strong>
                    </div>
                </div>
            </section>

            {/* Key Terms Cards */}
            <section className="x_terms_keyterms container">
                <div className="x_terms_keyterms_grid">
                    {keyTerms.map((term) => (
                        <div className="x_terms_keyterm_card" key={term.id}>
                            <div className="x_terms_keyterm_icon">{term.icon}</div>
                            <h3>{term.title}</h3>
                            <p>{term.content}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Detailed Terms Section */}
            <section className="x_terms_detailed container">
                <div className="x_terms_detailed_header">
                    <h2>Complete Terms & Conditions</h2>
                    <p>Full details about your rights and responsibilities</p>
                </div>

                <div className="x_terms_content">
                    {sections.map((section) => (
                        <div
                            className="x_terms_section"
                            key={section.id}
                            onClick={() => toggleSection(section.id)}
                        >
                            <h3 className="x_terms_section_title">
                                <span>{section.title}</span>
                                <span className={`x_terms_toggle ${expandedSection === section.id ? 'x_active' : ''}`}>
                                    ▼
                                </span>
                            </h3>
                            {expandedSection === section.id && (
                                <p className="x_terms_section_content">{section.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Important Notes */}
            <section className="x_terms_important">
                <div className="x_terms_important_content container">
                    <h2>Important to Know</h2>

                    <div className="x_terms_notes_grid">
                        <div className="x_terms_note_card">
                            <div className="x_terms_note_header">
                                <Shield size={24} />
                                <h4>Privacy & Security</h4>
                            </div>
                            <p>
                                We protect your personal information with industry-standard security measures. For
                                more details, see our Privacy Policy.
                            </p>
                        </div>

                        <div className="x_terms_note_card">
                            <div className="x_terms_note_header">
                                <AlertCircle size={24} />
                                <h4>Your Responsibilities</h4>
                            </div>
                            <p>
                                You agree to use our services lawfully and respectfully. Harassment or illegal
                                behavior will not be tolerated.
                            </p>
                        </div>

                        <div className="x_terms_note_card">
                            <div className="x_terms_note_header">
                                <CheckCircle2 size={24} />
                                <h4>Service Changes</h4>
                            </div>
                            <p>
                                We reserve the right to modify these terms or services at any time. We'll notify
                                you of major changes.
                            </p>
                        </div>

                        <div className="x_terms_note_card">
                            <div className="x_terms_note_header">
                                <FileText size={24} />
                                <h4>Third-Party Links</h4>
                            </div>
                            <p>
                                Our website may contain links to third-party sites. We're not responsible for their
                                content or practices.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agreement Confirmation */}
            <section className="x_terms_agreement container">
                <div className="x_terms_agreement_box">
                    <h3>By Using Our Services You Agree To:</h3>
                    <ul className="x_terms_checklist">
                        <li>
                            <CheckCircle2 size={20} />
                            <span>Accept these Terms and Conditions in their entirety</span>
                        </li>
                        <li>
                            <CheckCircle2 size={20} />
                            <span>Comply with all applicable laws and regulations</span>
                        </li>
                        <li>
                            <CheckCircle2 size={20} />
                            <span>Respect our intellectual property and that of others</span>
                        </li>
                        <li>
                            <CheckCircle2 size={20} />
                            <span>Maintain appropriate conduct and behavior</span>
                        </li>
                        <li>
                            <CheckCircle2 size={20} />
                            <span>Provide accurate information for reservations and accounts</span>
                        </li>
                        <li>
                            <CheckCircle2 size={20} />
                            <span>Understand and accept our liability limitations</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Contact Section */}
            <section className="x_terms_contact">
                <div className="x_terms_contact_content container">
                    <h2>Questions About These Terms?</h2>
                    <p>
                        If you have any questions or concerns about our Terms and Conditions, please don't
                        hesitate to reach out.
                    </p>

                    <div className="x_terms_contact_options">
                        <a href="/contact" className="x_terms_contact_btn x_terms_contact_primary">
                            Contact Us
                        </a>
                        <a href="/privacy" className="x_terms_contact_btn x_terms_contact_secondary">
                            Privacy Policy
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default TermsAndConditions;
