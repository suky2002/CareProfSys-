import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const allBadges = [
  { label: "Beginner", image: "/Imagini/badge1.png", coins: 1, pdf: "/pdfs/Producing for TV and Video - A Real-World Approach.pdf" },
  { label: "Intermediate", image: "/Imagini/badge2.png", coins: 2, pdf: "/pdfs/CCRT-102.pdf" },
  { label: "Expert", image: "/Imagini/badge3.png", coins: 3, pdf: "/pdfs/TVEquipmentStudioManual.pdf" },
];

const defaultBadgesByLevel = {
  "Level 1": [allBadges[0]],
  "Level 2": [allBadges[1]],
  "Level 3": [allBadges[2]],
};

function getSavedBadgesByLevel() {
  try {
    const saved = localStorage.getItem("badgesByLevel");
    if (saved) return JSON.parse(saved);
    return defaultBadgesByLevel;
  } catch {
    return defaultBadgesByLevel;
  }
}

const recommendedCourses = [
  {
    name: "Faculty of Engineering in Foreign Languages (FILS)",
    link: "https://fils.upb.ro/ro/home/",
    image: "https://fils.upb.ro/wp-content/uploads/2022/02/cropped-cropped-cropped-fils.png",
  },
  {
    name: "Faculty of Electronics, Telecommunications and Information Technology",
    link: "https://etti.upb.ro/en/",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Sigla_Facultate_ETTI.webp/530px-Sigla_Facultate_ETTI.webp.png",
  },
  {
    name: "Faculty of Automatic Control and Computers (ACS)",
    link: "https://acs.pub.ro/en/",
    image: "https://acs.pub.ro/wp-content/themes/twentythirteen/img/ro/acs_mobi.png",
  },
  {
    name: "Faculty of Electrical Engineering",
    link: "https://electro.upb.ro/en/",
    image: "https://upb.ro/wp-content/uploads/2018/03/sigla_facultatea_de_inginerie-300x300.png.webp",
  },
];

const certifications = [
  {
    name: "Cisco Certified Network Associate (CCNA)",
    link: "https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html",
    image: "https://lobbymap.org/site//data/001/361/1361662.png",
  },
  {
    name: "AWS Academy Graduate - AWS Academy Cloud Foundations",
    link: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    image: "https://images.credly.com/images/73e4a58b-a8ef-41a3-a7db-9183dd269882/image.png",
  },
  {
    name: "CompTIA Network+",
    link: "https://www.comptia.org/certifications/network",
    image: "https://www.sensetraining.co.uk/assets%20-%20logos/compTIAlogo.png",
  },
];

const CourseRecommendations = () => {
  const navigate = useNavigate();
  const [badgesByLevel] = useState(getSavedBadgesByLevel());

  const allUserBadges = Object.values(badgesByLevel).flat();
  const uniqueBadges = Array.from(new Map(allUserBadges.map(b => [b.label, b])).values());
  const totalBadges = allUserBadges.length;
  const totalCoins = allUserBadges.reduce((sum, b) => sum + b.coins, 0);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-950 via-purple-900 to-blue-900 flex items-center justify-center px-2 py-8 overflow-auto">
      <div className="w-full max-w-[1600px] flex flex-col md:flex-row gap-12 items-center justify-center mt-24 md:mt-0">
        <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-blue-800 via-purple-900 to-blue-950 rounded-2xl shadow-lg p-10 border-2 border-blue-800 min-w-[350px] max-w-[600px]">
          <h3 className="text-3xl font-bold mb-8 text-white tracking-wide text-center">Badges Unlocked</h3>
          <div className="flex flex-row gap-10 mb-8 flex-wrap justify-center items-center">
            {Object.entries(badgesByLevel).map(([level, badges]) => (
              <div key={level} className="flex flex-col items-center min-w-[120px]">
                <div className="text-lg font-bold mb-2 text-white">{level}</div>
                <div className="flex gap-2 mb-2">
                  {badges.map((badge, bidx) => (
                    <a
                      key={bidx}
                      href={badge.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Download ${badge.label} badge PDF`}
                    >
                      <img
                        src={badge.image}
                        alt={badge.label}
                        className="w-16 h-16 object-contain rounded-full border-2 border-white hover:scale-110 transition"
                      />
                    </a>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-yellow-300 font-bold text-base">
                  {badges.reduce((sum, b) => sum + b.coins, 0)} <span>🪙</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-10 flex-wrap justify-center mb-6">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">Total Badges</span>
              <span className="text-2xl font-extrabold text-blue-200 flex items-center gap-2">
                {totalBadges}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">Unique Badges</span>
              <span className="text-2xl font-extrabold text-purple-200 flex items-center gap-2">
                {uniqueBadges.length}
                {uniqueBadges.map((b, idx) => (
                  <img key={idx} src={b.image} alt={b.label} className="w-8 h-8 inline-block mx-1" />
                ))}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">Total Coins</span>
              <span className="text-2xl font-extrabold text-yellow-300 flex items-center gap-1">{totalCoins} 🪙</span>
            </div>
          </div>
          <div className="mt-2 text-white text-center text-lg max-w-xs mx-auto">
            You have unlocked electronic resources! Download your badge PDFs and use your coins to access more content.
          </div>
          <div className="flex flex-wrap gap-4 w-full justify-center mt-8">
            <button
              onClick={() => navigate("/review")}
              className="bg-blue-800 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-blue-900 transition-all"
            >
              Back to Review
            </button>
            <button
              onClick={() => navigate("/job-portal")}
              className="bg-purple-800 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-purple-900 transition-all"
            >
              Go to Job Portal
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 rounded-2xl shadow-lg p-10 border-2 border-purple-800 min-w-[350px] max-w-[800px]">
          <h3 className="text-3xl font-bold mb-8 text-blue-200 text-center">Universities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 w-full justify-items-center">
            {recommendedCourses.map((course, idx) => (
              <a
                key={idx}
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center bg-white bg-opacity-90 rounded-lg p-4 border-2 border-blue-200 hover:border-blue-500 shadow transition w-full"
              >
                <img src={course.image} alt={course.name} className="w-20 h-20 object-contain mb-2" />
                <div className="font-semibold text-blue-700 text-center">{course.name}</div>
              </a>
            ))}
          </div>
          <h3 className="text-3xl font-bold mb-8 text-purple-200 text-center">Certifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full justify-items-center">
            {certifications.map((cert, idx) => (
              <a
                key={idx}
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center bg-white bg-opacity-90 rounded-lg p-4 border-2 border-purple-200 hover:border-purple-500 shadow transition w-full"
              >
                <img src={cert.image} alt={cert.name} className="w-20 h-20 object-contain mb-2" />
                <div className="font-semibold text-purple-700 text-center">{cert.name}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseRecommendations;