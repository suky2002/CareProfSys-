import React, { useEffect, useState } from "react";
import { FaUniversity, FaCertificate } from "react-icons/fa";

const CourseRecommendations = () => {
  // navigation handlers
  const navigateToRecommendations = () => (window.location.href = "/");
  const navigateToPreviousVRExperience = () => (window.location.href = "/robert");

  // data arrays
  const recommendedCourses = [
    {
      name: "Faculty of Engineering in Foreign Languages (FILS)",
      description:
        "Programs in English, French, and German, focusing on engineering fields like telecommunications and computer science.",
      link: "https://fils.upb.ro/ro/home/",
      image:
        "https://fils.upb.ro/wp-content/uploads/2022/02/cropped-cropped-cropped-fils.png",
    },
    {
      name:
        "Faculty of Electronics, Telecommunications and Information Technology",
      description: "Focus on telecommunications and signal processing.",
      link: "https://etti.upb.ro/en/",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Sigla_Facultate_ETTI.webp/530px-Sigla_Facultate_ETTI.webp.png",
    },
    {
      name: "Faculty of Automatic Control and Computers (ACS)",
      description:
        "Study computer science, artificial intelligence, and automation engineering.",
      link: "https://acs.pub.ro/en/",
      image:
        "https://acs.pub.ro/wp-content/themes/twentythirteen/img/ro/acs_mobi.png",
    },
    {
      name: "Faculty of Electrical Engineering",
      description:
        "Specialize in electrical systems, renewable energy, and industrial applications.",
      link: "https://electro.upb.ro/en/",
      image:
        "https://upb.ro/wp-content/uploads/2018/03/sigla_facultatea_de_inginerie-300x300.png.webp",
    },
  ];

  const certifications = [
    {
      name: "Cisco Certified Network Associate (CCNA)",
      description:
        "Globally recognized certification focusing on networking fundamentals, security, and automation.",
      link:
        "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html",
      image: "https://lobbymap.org/site//data/001/361/1361662.png",
    },
    {
      name: "AWS Academy Graduate - AWS Academy Cloud Foundations",
      description:
        "Certification for expertise in cloud architecture and deploying scalable systems on AWS.",
      link:
        "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
      image:
        "https://images.credly.com/images/73e4a58b-a8ef-41a3-a7db-9183dd269882/image.png",
    },
    {
      name: "CompTIA Network+",
      description:
        "Validates the knowledge required for managing, troubleshooting, and configuring networks.",
      link: "https://www.comptia.org/certifications/network",
       image: "data:image/png;base64,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",
    },
  ];

  // reusable slider component
  const Slider = ({ items }) => {
    const [index, setIndex] = useState(0);
    const visibleCount = 3;

    const prev = () =>
      setIndex((i) =>
        i === 0 ? items.length - visibleCount : Math.max(i - 1, 0)
      );
    const next = () =>
      setIndex((i) =>
        i === items.length - visibleCount ? 0 : Math.min(i + 1, items.length - visibleCount)
      );

    // auto-advance every 4s
    useEffect(() => {
      const t = setInterval(next, 4000);
      return () => clearInterval(t);
    }, []);

    return (
      <div style={styles.slider}>
        <button style={styles.nav} onClick={prev}>
          ◀
        </button>
        <div style={styles.track}>
          <div
            style={{
              ...styles.inner,
              transform: `translateX(-${(100 / visibleCount) * index}%)`,
            }}
          >
            {items.map((item, idx) => (
              <div key={idx} style={styles.card}>
                <img src={item.image} alt={item.name} style={styles.img} />
                <h3 style={styles.title}>{item.name}</h3>
                <p style={styles.desc}>{item.description}</p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.button}
                >
                  Learn More
                </a>
              </div>
            ))}
          </div>
        </div>
        <button style={styles.nav} onClick={next}>
          ▶
        </button>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      {/* header */}
      <header style={styles.header}>
        <h1 style={styles.h1}>Explore Opportunities</h1>
        <div>
          <button
            style={styles.headerBtn}
            onClick={navigateToPreviousVRExperience}
          >
            Previous VR
          </button>
          <button
            style={styles.headerBtn}
            onClick={navigateToRecommendations}
          >
            Another Experience
          </button>
        </div>
      </header>

      {/* main content */}
      <main style={styles.main}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <FaUniversity style={styles.icon} />
            Universities
          </h2>
          <Slider items={recommendedCourses} />
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <FaCertificate style={styles.icon} />
            Certifications
          </h2>
          <Slider items={certifications} />
        </section>
      </main>

      {/* footer */}
      <footer style={styles.footer}>
        © 2025 CareProfSys++. All rights reserved.
      </footer>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: `"Segoe UI", sans-serif`,
    background: `linear-gradient(120deg, #e8f5e9 50%, #f1f8e9 50%)`,
    minHeight: "100vh",
    overflowX: "hidden",
  },
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    background: "#388E3C",
    color: "#fff",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  h1: {
    margin: 0,
    fontSize: "1.25rem",
  },
  headerBtn: {
    marginLeft: "0.5rem",
    padding: "0.5rem 1rem",
    background: "transparent",
    border: "1px solid #fff",
    borderRadius: 4,
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  main: {
    paddingTop: "5rem",
    paddingBottom: "3rem",
  },
  section: {
    margin: "3rem 2rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    color: "#2E7D32",
  },
  icon: {
    marginRight: "0.5rem",
  },
  slider: {
    display: "flex",
    alignItems: "center",
  },
  nav: {
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 32,
    height: 32,
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  track: {
    flex: 1,
    overflow: "hidden",
    margin: "0 1rem",
  },
  inner: {
    display: "flex",
    transition: "transform 0.8s ease",
  },
  card: {
    flex: "0 0 calc(33.333% - 1rem)",
    background: "#fff",
    borderRadius: 8,
    padding: "1rem",
    margin: "0.5rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  img: {
    width: 60,
    height: 60,
    objectFit: "contain",
    marginBottom: "0.75rem",
  },
  title: {
    fontSize: "1rem",
    margin: "0 0 0.5rem",
    color: "#1B5E20",
  },
  desc: {
    fontSize: "0.875rem",
    color: "#555",
    lineHeight: 1.4,
    marginBottom: "1rem",
  },
  button: {
    display: "inline-block",
    padding: "0.5rem 1rem",
    background: "#4CAF50",
    color: "#fff",
    borderRadius: 4,
    textDecoration: "none",
    transition: "background 0.3s",
  },
  footer: {
    textAlign: "center",
    padding: "1rem",
    background: "#2E7D32",
    color: "#fff",
    position: "fixed",
    bottom: 0,
    width: "100%",
  },
};

// Hover styles (JS-in-JS example; depends on your setup)
styles.card[":hover"] = {
  transform: "translateY(-4px)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
};
styles.button[":hover"] = { background: "#388E3C" };
styles.headerBtn[":hover"] = { background: "rgba(255,255,255,0.2)" };

export default CourseRecommendations;
