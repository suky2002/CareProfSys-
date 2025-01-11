import React, { useEffect, useState } from "react";

const CourseRecommendations = () => {

  const navigateToRecommendations = () => {
    // Navighează către pagina de recomandări
    window.location.href = "/";
  };

  const navigateToPreviousVRExperience = () => {
    // Navighează către experiența VR anterioară
    window.location.href = "/environment-two";
  };

  
  const recommendedCourses = [
    {
      name: "Faculty of Engineering in Foreign Languages (FILS)",
      description:
        "Programs in English, French, and German, focusing on engineering fields like telecommunications and computer science.",
      link: "https://ing.pub.ro/en/",
      image: "https://fils.upb.ro/wp-content/uploads/2022/02/cropped-cropped-cropped-fils.png",
    },
    {
      name: "Faculty of Electronics, Telecommunications and Information Technology",
      description: "Focus on telecommunications and signal processing.",
      link: "https://etti.upb.ro/en/",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Sigla_Facultate_ETTI.webp/530px-Sigla_Facultate_ETTI.webp.png",
    },
    {
      name: "Faculty of Automatic Control and Computers (ACS)",
      description:
        "Study computer science, artificial intelligence, and automation engineering.",
      link: "https://acs.pub.ro/en/",
      image: "https://acs.pub.ro/wp-content/themes/twentythirteen/img/ro/acs_mobi.png",
    },
    {
      name: "Faculty of Electrical Engineering",
      description:
        "Specialize in electrical systems, renewable energy, and industrial applications.",
      link: "https://electro.upb.ro/en/",
      image: "https://upb.ro/wp-content/uploads/2018/03/sigla_facultatea_de_inginerie-300x300.png.webp",
    },
  ];

  const certifications = [
    {
      name: "Cisco Certified Network Associate (CCNA)",
      description:
        "Globally recognized certification focusing on networking fundamentals, security, and automation.",
      link: "https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html",
      image: "https://lobbymap.org/site//data/001/361/1361662.png",
    },
    {
      name: "AWS Academy Graduate - AWS Academy Cloud Foundations",
      description:
        "Certification for expertise in cloud architecture and deploying scalable systems on AWS.",
      link: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
      image: "https://images.credly.com/images/73e4a58b-a8ef-41a3-a7db-9183dd269882/image.png",
    },
    {
      name: "CompTIA Network+",
      description:
        "Validates the knowledge required for managing, troubleshooting, and configuring networks.",
      link: "https://www.comptia.org/certifications/network",
      image: "https://www.sensetraining.co.uk/assets%20-%20logos/compTIAlogo.png",
    },
  ];

  const Slider = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const visibleItems = 3;

    const goToPrevious = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? items.length - visibleItems : prevIndex - 1
      );
    };

    const goToNext = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === items.length - visibleItems ? 0 : prevIndex + 1
      );
    };

    useEffect(() => {
      const interval = setInterval(() => {
        goToNext();
      }, 3000); // Slide automatically every 3 seconds
      return () => clearInterval(interval);
    }, []);

    return (
      <div style={sliderContainerStyle}>
        <button style={navButtonStyle} onClick={goToPrevious}>
          ◀
        </button>
        <div style={cardsWrapperStyle}>
          <div
            style={{
              ...cardsContainerStyle,
              transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
            }}
          >
            {items.map((item, index) => (
              <div key={index} style={cardStyle}>
                <img src={item.image} alt={item.name} style={imageStyle} />
                <h3 style={cardTitleStyle}>{item.name}</h3>
                <p style={cardDescriptionStyle}>{item.description}</p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkStyle}
                >
                  Learn More
                </a>
              </div>
            ))}
          </div>
        </div>
        <button style={navButtonStyle} onClick={goToNext}>
          ▶
        </button>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ margin: "0", fontSize: "18px" }}>Explore Opportunities</h1>
        <div>
        <button style={headerButtonStyle} onClick={navigateToPreviousVRExperience}>Explore Previous VR Experience</button>
        <button style={headerButtonStyle} onClick={navigateToRecommendations}>Explore Another Experience</button>
          
        </div>
      </header>
      <main style={mainStyle}>
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Universities</h2>
          <Slider items={recommendedCourses} />
        </div>
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Certifications</h2>
          <Slider items={certifications} />
        </div>
      </main>
      <footer style={footerStyle}>
        <p>© 2025 CareProfSys++. All rights reserved.</p>
      </footer>
    </div>
  );
};

const headerButtonStyle = {
  backgroundColor: "transparent", // Fără background
  color: "#fff", // Text alb
  border: "1px solid #fff", // Border alb subțire
  borderRadius: "5px",
  padding: "8px 15px", // Dimensiune ajustată pentru mobile
  cursor: "pointer",
  fontSize: "14px",
  marginLeft: "10px",
  "@media (max-width: 768px)": {
    marginLeft: "0", // Eliminăm spațiul lateral
    width: "100%", // Butoanele ocupă întreaga lățime
  },
};


const containerStyle = {
  fontFamily: "Arial, sans-serif",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  margin: "0",
  boxSizing: "border-box",
  overflow: "hidden",
  "@media (max-width: 768px)": {
    padding: "0 10px", // Micșorăm marginile pe tabletă și mobil
  },
};

const sectionStyle = {
  margin: "40px 10px",
};

const cardsWrapperStyle = {
  overflow: "visible",
  width: "100%",
  display: "flex",
  justifyContent: "center",
};

const cardsContainerStyle = {
  display: "flex",
  transition: "transform 0.8s ease-in-out", // Animație lină
  width: "100%",
  height: "100%",
  gap: "20px", // Spațiu între carduri

  "@media (max-width: 480px)": {
    justifyContent: "flex-start", // Aliniere la stânga
    overflowX: "scroll", // Activăm scroll-ul pe mobil
    scrollSnapType: "x mandatory", // Scrolling fluid între carduri
    scrollPadding: "10px", // Spațiere interioară
    gap: "15px", // Reducem spațiul între carduri
  },
};


const cardDescriptionStyle = {
  fontSize: "12px",
  color: "#555",
  marginBottom: "5px",
  lineHeight: "1.4",
  "@media (max-width: 480px)": {
    fontSize: "10px", // Text mai mic pentru descriere
  },
};

const imageStyle = {
  width: "60px",
  height: "60px",
  objectFit: "contain",
  marginBottom: "10px",
};

const navButtonStyle = {
  backgroundColor: "#EC7015",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  cursor: "pointer",
  fontSize: "14px",
  margin: "0 10px",
  position: "relative",
  zIndex: 1,
  "@media (max-width: 480px)": {
    width: "25px",
    height: "25px",
    fontSize: "12px", // Font mai mic
  },
};


const linkStyle = {
  display: "inline-block",
  marginTop: "10px",
  padding: "8px 12px",
  backgroundColor: "#EC7015",
  color: "#fff",
  textDecoration: "none",
  borderRadius: "5px",
  fontSize: "12px",
};

const footerStyle = {
  backgroundColor: "#EC7015",
  textAlign: "center",
  color: "#fff",
  fontSize: "12px",
  position: "fixed",
  bottom: "0",
  left: "0",
  width: "100%",
  zIndex: 1000,
  padding: "5px 10px", // Padding mai mic pe mobil
  "@media (max-width: 480px)": {
    fontSize: "10px", // Font mai mic
  },
};


const mainStyle = {
  flex: "1",
  overflowY: "auto",
  marginTop: "50px",
};

const headerStyle = {
  backgroundColor: "#EC7015",
  color: "#fff",
  padding: "15px 50px 15px", // Ajustăm padding-ul pentru ecrane mai mici
  fontSize: "16px",
  position: "fixed",
  top: "0",
  left: "0",
  width: "95%", // Folosim toată lățimea ecranului
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap", // Permitem conținutului să se împacheteze pe rânduri
  gap: "10px", // Spațiu între elemente
  "@media (max-width: 768px)": {
    flexDirection: "column", // Toate elementele pe rânduri diferite
    alignItems: "flex-start", // Aliniem la stânga
  },
};


const cardStyle = {
  backgroundColor: "#f9f9f9",
  borderRadius: "10px",
  boxShadow: "0px 4px 8px rgba(4, 110, 224, 0.28)",
  padding: "15px",
  flex: "1 1 calc(33.33% - 70px)", // Trei carduri pe desktop
  margin: "0 10px",
  textAlign: "left",
  overflow: "hidden",
  "@media (max-width: 768px)": {
    flex: "1 1 calc(50% - 20px)", // Două carduri pe tabletă
  },
  "@media (max-width: 480px)": {
    flex: "1 1 100%", // Un card pe telefon
  },
};


const sliderContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "relative",
  margin: "0 auto",
  maxWidth: "100%",
  "@media (max-width: 480px)": {
    overflowX: "scroll", // Scroll orizontal pe telefoane
    gap: "10px", // Spațiere între elemente
  },
};



const sectionTitleStyle = {
  textAlign: "left",
  fontSize: "20px",
  marginBottom: "10px",
  padding: "0 20px",
  "@media (max-width: 480px)": {
    fontSize: "16px", // Text mai mic pe telefoane
    padding: "0 10px", // Reducem padding-ul
  },
};

const cardTitleStyle = {
  fontSize: "14px",
  margin: "10px 0",
  color: "#333",
  "@media (max-width: 480px)": {
    fontSize: "12px", // Text mai mic pe mobil
  },
};



export default CourseRecommendations;
