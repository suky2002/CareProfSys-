import React, { useState, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useProgress } from "@react-three/drei";
import { motion } from "framer-motion";
import { Menu, X, ArrowRightCircle } from "lucide-react";
import emailjs from "emailjs-com";
import styles from "./css/LandingPage.module.css";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

emailjs.init("OQ7jKakPsDW33JA0g");


const Loader = () => {
  const { progress } = useProgress();
  return (
    <div className={styles.loaderOverlay}>
      <Html center>{Math.floor(progress)}% loaded</Html>
    </div>
  );
};

const VRModel = () => (
  <mesh rotation={[0, Math.PI / 4, 0]}>
    <boxBufferGeometry args={[1.5, 1.5, 1.5]} />
    <meshStandardMaterial color="var(--color-secondary)" />
  </mesh>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [email, setEmail] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();

    const serviceID = "service_628799u";
    const ownerTemplateID = "template_2xx0mld";
    const confirmTemplateID = "template_b2it3ht";
    const publicKey = "OQ7jKakPsDW33JA0g";

    const trimmedEmail = email.trim();

    if (trimmedEmail === "") {
      alert("Email is empty. Please enter a valid address.");
      return;
    }

    try {
      console.log("📤 Sending confirmation to subscriber:", trimmedEmail);
      await emailjs.send(serviceID, confirmTemplateID, {
        user_email: trimmedEmail
      }, publicKey);

      console.log("📥 Sending notification to owner:", trimmedEmail);
      await emailjs.send(serviceID, ownerTemplateID, {
        user_email: trimmedEmail
      }, publicKey);

      console.log("💾 Saving to Firestore:", trimmedEmail);
      await addDoc(collection(db, "subscribers"), {
        email: trimmedEmail,
        subscribedAt: Timestamp.now()
      });

      alert("Thank you for subscribing! A confirmation email has been sent to you.");
      setEmail("");
    } catch (err) {
      console.error("❌ Subscription error:", err);

      if (err?.text) {
        alert("EmailJS error: " + err.text);
      } else {
        alert("An unknown error occurred. Please try again.");
      }
    }
  };

  const features = [
    { icon: "🌐", title: "Immersive Simulations", desc: "WebXR-powered environments for hands-on trials." },
    { icon: "🧠", title: "AI Recommendations", desc: "Match your skills to roles with intelligent guidance." },
    { icon: "📚", title: "Education Integrations", desc: "Seamless connection with courses & credentials." },
    { icon: "🕹", title: "Gamified Trials", desc: "Learn and test both hard and soft skills interactively." },
    { icon: "📜", title: "Microcredentials", desc: "Earn badges to showcase your competencies." },
    { icon: "🌍", title: "Global Network", desc: "Connect with mentors and peers worldwide." },
  ];

  const faqs = [
    { question: "How do I access the VR simulations?", answer: "Simply click 'Start Exploring' and follow the onboarding steps; no additional installs needed." },
    { question: "Can I track my progress?", answer: "We will provide an update for this one, please follow up on email." },
    { question: "Are educational credentials recognized?", answer: "We partner with accredited institutions to issue microcredentials that boost your portfolio." },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title} onClick={() => navigate("/")}>
          CareProfSys++
        </h1>
        <nav className={styles.nav}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#experience" className={styles.navLink}>Experience</a>
          <a href="#faqs" className={styles.navLink}>FAQs</a>

        </nav>
        <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </header>
      {mobileOpen && (
        <nav className={styles.mobileNav}>
          <a href="#features" className={styles.navLinkBlock}>Features</a>
          <a href="#experience" className={styles.navLinkBlock}>Experience</a>
          <a href="#faqs" className={styles.navLinkBlock}>FAQs</a>
          <button className={styles.signInBlock} onClick={() => navigate("/login")}>
            Sign In
          </button>
        </nav>
      )}

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
