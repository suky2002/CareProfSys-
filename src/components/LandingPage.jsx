// src/components/LandingPage.jsx

import React, { useState, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useProgress } from "@react-three/drei";
import { motion } from "framer-motion";
import { Menu, X, ArrowRightCircle } from "lucide-react";
import emailjs from "emailjs-com";
import styles from "./css/LandingPage.module.css";

// Initialize EmailJS with your Public Key
emailjs.init("OQ7jKakPsDW33JA0g");

// Loader for 3D model
const Loader = () => {
  const { progress } = useProgress();
  return (
    <div className={styles.loaderOverlay}>
      <Html center>{Math.floor(progress)}% loaded</Html>
    </div>
  );
};

// Placeholder VR model component
const VRModel = () => (
  <mesh rotation={[0, Math.PI / 4, 0]}>
    <boxBufferGeometry args={[1.5, 1.5, 1.5]} />
    <meshStandardMaterial color="var(--color-secondary)" />
  </mesh>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // --- EmailJS subscription state & handler ---
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();

    const serviceID         = "service_628799u";
    const ownerTemplateID   = "template_2xx0mld";     // notificare către tine
    const confirmTemplateID = "template_b2it3ht";     // confirmare abonat
    const publicKey         = "OQ7jKakPsDW33JA0g";

    // 1) Trimite notificarea către tine
    emailjs
      .send(serviceID, ownerTemplateID, { user_email: email }, publicKey)
      .then(() => {
        // 2) Apoi trimite emailul de bun-venit către abonat
        return emailjs.send(
          serviceID,
          confirmTemplateID,
          { user_email: email },
          publicKey
        );
      })
      .then(() => {
        alert("Mulțumim pentru abonare! Vei primi un email de confirmare.");
        setEmail("");
      })
      .catch((err) => {
        console.error("EmailJS error:", err);
        alert("Ceva nu a mers. Te rog încearcă din nou.");
      });
  };
  // ----------------------------------------------

  const features = [
    { icon: "🌐", title: "Immersive Simulations",    desc: "WebXR-powered environments for hands-on trials." },
    { icon: "🧠", title: "AI Recommendations",        desc: "Match your skills to roles with intelligent guidance." },
    { icon: "📚", title: "Education Integrations",   desc: "Seamless connection with courses & credentials." },
    { icon: "🕹", title: "Gamified Trials",           desc: "Learn and test both hard and soft skills interactively." },
    { icon: "📜", title: "Microcredentials",         desc: "Earn badges to showcase your competencies." },
    { icon: "🌍", title: "Global Network",           desc: "Connect with mentors and peers worldwide." },
  ];

  const faqs = [
    { question: "How do I access the VR simulations?", answer: "Simply click 'Start Exploring' and follow the onboarding steps; no additional installs needed." },
    { question: "Can I track my progress?",            answer: "Yes—our dashboard logs your sessions, earned credentials, and AI insights over time." },
    { question: "Are educational credentials recognized?", answer: "We partner with accredited institutions to issue microcredentials that boost your portfolio." },
  ];

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <header className={styles.header}>
        <h1 className={styles.title} onClick={() => navigate("/")}>
          CareProfSys++
        </h1>
        <nav className={styles.nav}>
          <a href="#features"  className={styles.navLink}>Features</a>
          <a href="#experience" className={styles.navLink}>Experience</a>
          <a href="#faqs"      className={styles.navLink}>FAQs</a>
          <button className={styles.signIn} onClick={() => navigate("/login")}>
            Sign In
          </button>
        </nav>
        <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className={styles.mobileNav}>
          <a href="#features"  className={styles.navLinkBlock}>Features</a>
          <a href="#experience" className={styles.navLinkBlock}>Experience</a>
          <a href="#faqs"      className={styles.navLinkBlock}>FAQs</a>
          <button className={styles.signInBlock} onClick={() => navigate("/login")}>
            Sign In
          </button>
        </nav>
      )}

      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.h2
          className={styles.heroTitle}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Explore Your Future Career in <span className={styles.highlight}>Immersive VR</span>
        </motion.h2>
        <motion.p
          className={styles.heroSubtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          CareProfSys++ combines WebXR, AI-driven recommendations, and gamified simulations to help you discover and prepare for your dream profession.
        </motion.p>
        <button className={styles.startButton} onClick={() => navigate("/start")}>
          Start Exploring <ArrowRightCircle />
        </button>
      </section>

      {/* 3D Experience Preview */}
      <section id="experience" className={`${styles.section} ${styles.experience}`}>
        <Canvas>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 7]} intensity={0.6} />
          <Suspense fallback={<Loader />}>
            <VRModel />
          </Suspense>
          <OrbitControls autoRotate autoRotateSpeed={1.5} />
        </Canvas>
        <div className={styles.modelHint}>Rotate the model to preview VR setup</div>
      </section>

      {/* Platform Features */}
      <section id="features" className={`${styles.section} ${styles.featuresSection}`}>
        <h3 className={styles.sectionTitle}>Platform Features</h3>
        <div className={styles.featuresGrid}>
          {features.map((feat, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feat.icon}</div>
              <h4 className={styles.featureTitle}>{feat.title}</h4>
              <p className={styles.featureDesc}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className={`${styles.section} ${styles.faqSection}`}>
        <h3 className={styles.sectionTitle}>Frequently Asked Questions</h3>
        <div className={styles.faqList}>
          {faqs.map((faq, idx) => (
            <details key={idx} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>{faq.question}</summary>
              <p className={styles.faqAnswer}>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Subscription Section */}
      <section className={`${styles.section} ${styles.subscription}`}>
        <h3 className={styles.sectionTitle}>Stay Updated</h3>
        <p className={styles.sectionText}>
          Subscribe to our newsletter for the latest features, career tips, and exclusive VR content.
        </p>
        <form className={styles.subscriptionForm} onSubmit={handleSubscribe}>
          <label htmlFor="email" className={styles.label}>Email Address</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className={styles.startButton}>
            Subscribe
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <h4 className={styles.footerTitle}>CareProfSys++</h4>
            <p>Empowering your future, one VR simulation at a time.</p>
          </div>
        </div>
        <div className={styles.footerCopy}>© 2025 CareProfSys++. All rights reserved.</div>
      </footer>
    </div>
  );
}
