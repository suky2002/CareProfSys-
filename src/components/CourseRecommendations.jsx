import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CourseRecommendations = () => {
  const navigate = useNavigate();

  const recommendedCourses = [
    {
      name: "Faculty of Engineering in Foreign Languages (FILS)",
      description: "Programs in English, French, and German, focusing on engineering fields like telecommunications and computer science.",
      link: "https://fils.upb.ro/ro/home/",
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
      description: "Study computer science, artificial intelligence, and automation engineering.",
      link: "https://acs.pub.ro/en/",
      image: "https://acs.pub.ro/wp-content/themes/twentythirteen/img/ro/acs_mobi.png",
    },
    {
      name: "Faculty of Electrical Engineering",
      description: "Specialize in electrical systems, renewable energy, and industrial applications.",
      link: "https://electro.upb.ro/en/",
      image: "https://upb.ro/wp-content/uploads/2018/03/sigla_facultatea_de_inginerie-300x300.png.webp",
    },
  ];

  const certifications = [
    {
      name: "Cisco Certified Network Associate (CCNA)",
      description: "Globally recognized certification focusing on networking fundamentals, security, and automation.",
      link: "https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html",
      image: "https://lobbymap.org/site//data/001/361/1361662.png",
    },
    {
      name: "AWS Academy Graduate - AWS Academy Cloud Foundations",
      description: "Certification for expertise in cloud architecture and deploying scalable systems on AWS.",
      link: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
      image: "https://images.credly.com/images/73e4a58b-a8ef-41a3-a7db-9183dd269882/image.png",
    },
    {
      name: "CompTIA Network+",
      description: "Validates the knowledge required for managing, troubleshooting, and configuring networks.",
      link: "https://www.comptia.org/certifications/network",
      image: "https://www.sensetraining.co.uk/assets%20-%20logos/compTIAlogo.png",
    },
  ];

 const Card = ({ item }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all group flex items-start gap-4"
  >
    <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg p-2">
      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
    </div>
    
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
        {item.name}
      </h3>
      
      <p className="text-gray-300 text-sm mb-4">
        {item.description}
      </p>
      
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm"
      >
        Learn More
      </a>
    </div>
  </motion.div>
);


  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
      
      <div className="absolute inset-0 flex flex-col z-10">
        <header className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
            >
              Educational Opportunities
            </motion.h1>
            
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/environment-two')}
                className="px-4 py-2 bg-gray-800/50 text-white rounded-lg hover:bg-gray-700/50 transition-all text-sm backdrop-blur-sm border border-gray-700"
              >
                Previous Experience
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm"
              >
                New Experience
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto py-8 px-4">
          <div className="max-w-7xl mx-auto space-y-12">
            <section>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
              >
                Universities
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedCourses.map((course, index) => (
                  <Card key={index} item={course} />
                ))}
              </div>
            </section>

            <section>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
              >
                Certifications
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certifications.map((cert, index) => (
                  <Card key={index} item={cert} />
                ))}
              </div>
            </section>
          </div>
        </main>

        <footer className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 backdrop-blur-sm border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <p className="text-center text-sm text-gray-400">
              © 2025 CareProfSys++. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CourseRecommendations;