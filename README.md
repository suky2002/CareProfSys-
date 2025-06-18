# CareProfSys

CareProfSys++ is an interactive web application that simulates a professional care and broadcast environment, combining 3D scenes, a gamified task system, a job portal, automation via UiPath, and panoramic scene navigation using [Marzipano](https://www.marzipano.net/). The project is built with React, Vite, Three.js, Node.js, and Marzipano, and is organized into modular components and scenes for a scalable, educational, and immersive experience.

---

## Table of Contents

- [Project Architecture](#project-architecture)
- [Features](#features)
- [Main Components](#main-components)
- [Scenes & Levels](#scenes--levels)
- [Panoramic Navigation (Marzipano)](#panoramic-navigation-marzipano)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Credits](#credits)
- [License](#license)

---

## Project Architecture

```
CareProfSys-/
│
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/
│   │   ├── StartScreen.jsx
│   │   ├── JobPortal.jsx
│   │   ├── TaskSystem.jsx
│   │   ├── QuizLevel.jsx
│   │   ├── MarzipanoPanorama.jsx        # Panoramic navigation using Marzipano
│   │   ├── EnvironmentThreeScene.jsx
│   │   ├── EnvironmentTwoScene.jsx
│   │   ├── ControlRoom.jsx
│   │   ├── Level1.jsx
│   │   ├── Level2.jsx
│   │   ├── CourseRecommendations.jsx
│   │   ├── CreateAvatar.jsx
│   │   ├── ResultsScreen.jsx
│   │   ├── TutorialOverlay2.jsx
│   │   ├── InstructionOverlay.jsx
│   │   ├── SurveillanceTask.jsx
│   │   ├── WiringTask.jsx
│   │   └── ... (other UI and utility components)
│   ├── data/
│   ├── scenes/
│   ├── utils/
│   └── ...
│
├── server/
│   ├── testToken.js
│   ├── index.js
│   ├── .env
│   └── ...
│
├── public/
├── package.json
├── README.md
└── ...
```

---

## Features

- **Start Screen:**  
  Welcomes users and lets them choose their path in the simulation.

- **Job Portal:**  
  Simulates a job application portal, allowing users to upload their CV and trigger backend automation (UiPath).

- **3D Interactive Scenes:**  
  Explore and interact with realistic environments such as the Control Room, Level 1, and Level 2 using Three.js.

- **Panoramic Navigation with Marzipano:**  
  Navigate between scenes and environments using Marzipano for immersive 360° panoramic views and transitions.

- **Gamified Task System:**  
  Complete context-specific tasks, earn points, and unlock badges as you progress through the simulation.

- **Quiz/Assessment Level:**  
  Test your knowledge and skills in a dedicated quiz scene.

- **Course Recommendations:**  
  Get personalized course suggestions based on your performance and choices.

- **Action Logs:**  
  Real-time feedback and traceability for all important actions.

- **Modern, Responsive UI:**  
  Accessible overlays for tasks, logs, scores, and more.

---

## Main Components

- **StartScreen.jsx:**  
  The entry point for users, providing navigation to different modules.

- **JobPortal.jsx:**  
  Handles CV upload and interaction with the backend automation system.

- **TaskSystem.jsx:**  
  Manages and displays tasks, user score, and badges for gamification.

- **QuizLevel.jsx:**  
  Presents quizzes or assessments as part of the learning journey.

- **MarzipanoPanorama.jsx:**  
  Integrates Marzipano for panoramic scene navigation, allowing users to explore 360° environments and transition between scenes.

- **EnvironmentThreeScene.jsx / EnvironmentTwoScene.jsx:**  
  Main 3D scenes for immersive exploration and interaction.

- **ControlRoom.jsx, Level1.jsx, Level2.jsx:**  
  Represent different environments and challenges within the simulation.

- **CourseRecommendations.jsx:**  
  Displays recommended courses based on user actions and quiz results.

- **CreateAvatar.jsx:**  
  Allows users to create and customize their avatar.

- **ResultsScreen.jsx:**  
  Shows final results and feedback at the end of the simulation.

- **TutorialOverlay2.jsx, InstructionOverlay.jsx:**  
  Provide onboarding and contextual instructions.

- **SurveillanceTask.jsx, WiringTask.jsx:**  
  Specialized interactive tasks within certain scenes.

---

## Scenes & Levels

The application is structured around several key scenes and levels, each with its own objectives and interactions:

- **Start Screen:**  
  The initial welcome and navigation screen.

- **Marzipano Panoramic Navigation:**  
  A central navigation tool where users can visually select and jump to any scene or level using 360° panoramic views. Each panorama represents a scene (e.g., Control Room, Level 1, Level 2, Quiz, Job Portal, etc.), making the experience immersive and modular.

- **Job Portal:**  
  Upload your CV and interact with job-related features.

- **Control Room (Level 1):**  
  The first major 3D scene, focused on orientation and basic broadcast tasks.

- **Level 2:**  
  Advanced scene with new challenges, such as wiring tasks and light control.

- **Quiz Level:**  
  Dedicated scene for quizzes and assessments.

- **Course Recommendations:**  
  Scene for personalized learning suggestions.

- **Other Specialized Scenes:**  
  Such as SurveillanceTask, WiringTask, and more, each accessible via the panoramic navigation.

---

## Panoramic Navigation (Marzipano)

The **MarzipanoPanorama** component uses the [Marzipano](https://www.marzipano.net/) library to provide immersive 360° panoramic navigation between scenes. This allows users to:

- Seamlessly explore and transition between different environments.
- Experience a non-linear, modular journey through the application.
- Visually select scenes and levels from a panoramic interface, enhancing immersion and usability.

Marzipano is a key technology in CareProfSys++, enabling intuitive and visually rich scene management.

---

## Prerequisites

- **Node.js** (Recommended: v18.x or v20.x)
- **npm** (comes with Node.js)
- **UiPath Orchestrator** account (for automation integration)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CareProfSys-.git
cd CareProfSys-
```

### 2. Install Dependencies

```bash
npm install
```

If you have a separate `server/` folder, also run:

```bash
cd server
npm install
cd ..
```

---

## Configuration

### 1. Backend Environment Variables

Create a `.env` file inside the `server/` directory with your UiPath credentials:

```
UIPATH_CLIENT_ID=your_uipath_client_id
UIPATH_CLIENT_SECRET=your_uipath_client_secret
```

> **Note:**  
> You can obtain these credentials from your UiPath Orchestrator under Admin > Tenants > API Access.

### 2. (Optional) Frontend Environment Variables

If your frontend needs to know the backend URL or other settings, create a `.env` file in the root or `src/`:

```
VITE_BACKEND_URL=http://localhost:3001
```

---

## Running the Application

### 1. Start the Backend

Navigate to the `server/` directory and start the backend server (example with Express):

```bash
cd server
node index.js
```

Or, if you only want to test UiPath authentication:

```bash
node testToken.js
```

### 2. Start the Frontend

In the project root:

```bash
npm run dev
```

This will start the Vite development server.  
By default, the app will be available at [http://localhost:5173](http://localhost:5173).

---

## Usage

- **Start Screen:**  
  Begin your journey and choose which module or scene to enter.

- **Panoramic Navigation (Marzipano):**  
  Use the panoramic interface to visually select and jump to any scene or level.

- **Job Portal:**  
  Upload your CV (.docx) and interact with job-related features.

- **3D Scenes (Control Room, Level 1, Level 2):**  
  Use your mouse and keyboard to navigate the virtual environment. Interact with objects to complete tasks and progress through levels.

- **Task System:**  
  View your current tasks, score, and badges in the overlay UI. Tasks are marked as completed as you interact with the environment.

- **Quiz Level:**  
  Take quizzes or assessments to test your knowledge and unlock achievements.

- **Course Recommendations:**  
  Receive personalized learning suggestions based on your simulation performance.

- **Action Logs:**  
  All important actions (task completions, uploads, etc.) are logged in the Action Logs panel for feedback and traceability.

---

## Troubleshooting

- **Vite or module errors:**  
  Run `npm install` and ensure you are using a compatible Node.js version.

- **UiPath authentication errors:**  
  Double-check your `.env` credentials and permissions in UiPath Orchestrator.

- **CV upload issues:**  
  Ensure the backend server is running and accessible at the correct port.

- **Port conflicts:**  
  If the default ports are in use, change them in your configuration files or scripts.

---

## Credits

- [React](https://react.dev/)
- [Three.js](https://threejs.org/)
- [Vite](https://vitejs.dev/)
- [UiPath](https://www.uipath.com/)
- [Marzipano](https://www.marzipano.net/)

---

## License

This project is for educational and demonstration purposes