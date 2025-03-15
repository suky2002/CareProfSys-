// EnvironmentThreeScene.jsx
// This file defines a complete React component that creates a dome environment
// for a broadcasting simulation. The user is placed inside an inverted sphere (the dome)
// with a panoramic studio background. It supports desktop first-person movement (via PointerLockControls)
// and VR (via VRButton). Helper classes and functions are declared at the end.

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GUI } from 'dat.gui';

export default function EnvironmentThreeScene() {
  // ----------------------------
  // Refs for THREE.js objects and DOM elements
  // ----------------------------
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const controlsRef = useRef(null);
  const guiRef = useRef(null);
  // Array for collidable objects
  const collidableMeshList = useRef([]);

  // Ref for the chat log container ("Action Logs")
  const chatLogRef = useRef(null);

  // ----------------------------
  // Movement flags and vectors (WASD)
  // ----------------------------
  const moveForwardRef = useRef(false);
  const moveBackwardRef = useRef(false);
  const moveLeftRef = useRef(false);
  const moveRightRef = useRef(false);
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const directionRef = useRef(new THREE.Vector3(0, 0, 0));

  // ----------------------------
  // UI State
  // ----------------------------
  const [chatMessages, setChatMessages] = useState([]);
  const [broadcastLevel, setBroadcastLevel] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // Collision parameters
  // ----------------------------
  const cameraColliderRadius = 0.5;
  const domeInnerRadius = 490; // Limit for camera movement inside the dome

  // ----------------------------
  // Helper: add a chat message (Action Logs)
  // ----------------------------
  const addChatMessage = useCallback((msg) => {
    setChatMessages((prev) => [...prev, msg]);
  }, []);

  // ----------------------------
  // Helper: Point-and-Click Interaction (Raycasting)
  // ----------------------------
  const pointAndClickInteraction = useCallback(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0); // center of screen
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    if (intersects.length > 0) {
      return `Interacted with ${intersects[0].object.name || 'an object'}.`;
    }
    return 'Nothing to interact with.';
  }, []);

  // ----------------------------
  // Auto-scroll Action Logs on new messages
  // ----------------------------
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // ----------------------------
  // Disable page scroll for full-screen experience
  // ----------------------------
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // ----------------------------
  // 1. Initialize Scene (with Dome Background)
  // ----------------------------
  const initScene = useCallback(() => {
    const scene = new THREE.Scene();
    // Create an inverted sphere ("dome") with a panoramic studio background.
    const domeGeometry = new THREE.SphereGeometry(500, 60, 40);
    domeGeometry.scale(-1, 1, 1);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/Imagini/studio/realistic-news-studio.jpg.jpg',
      (texture) => {
        const domeMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.name = 'StudioDome';
        scene.add(dome);
        setLoadingProgress(100);
        setLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = (xhr.loaded / xhr.total) * 100;
          setLoadingProgress(Math.round(percent));
        } else {
          setLoadingProgress(100);
        }
      },
      (error) => {
        console.error('Error loading dome texture:', error);
        setLoading(false);
      }
    );
    sceneRef.current = scene;
  }, []);

  // ----------------------------
  // 2. Initialize Camera
  // ----------------------------
  const initCamera = useCallback(() => {
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    // Fix vertical (Y) position at 1.8 so you remain on the floor
    camera.position.set(0, 1.8, 5);
    cameraRef.current = camera;
  }, []);

  // ----------------------------
  // 3. Initialize Renderer & VRButton
  // ----------------------------
  const initRenderer = useCallback(() => {
    const container = mountRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));
  }, []);

  // ----------------------------
  // 4. Initialize Controls & Keyboard Input
  // ----------------------------
  const initControls = useCallback(() => {
    const camera = cameraRef.current;
    const domElement = rendererRef.current.domElement;
    const controls = new PointerLockControls(camera, domElement);
    controls.addEventListener('lock', () => {
      addChatMessage('Pointer locked. Use WASD to move and press E to interact.');
    });
    controls.addEventListener('unlock', () => {
      addChatMessage('Pointer unlocked.');
    });
    controlsRef.current = controls;
    domElement.addEventListener('click', () => controls.lock());

    const onKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW': moveForwardRef.current = true; break;
        case 'KeyS': moveBackwardRef.current = true; break;
        case 'KeyA': moveLeftRef.current = true; break;
        case 'KeyD': moveRightRef.current = true; break;
        case 'Digit1':
          setBroadcastLevel(1);
          addChatMessage('Broadcast Level: 1 (Basic Studio Setup)');
          break;
        case 'Digit2':
          setBroadcastLevel(2);
          addChatMessage('Broadcast Level: 2 (Intermediate Tasks)');
          break;
        case 'Digit3':
          setBroadcastLevel(3);
          addChatMessage('Broadcast Level: 3 (Advanced Broadcast)');
          break;
        case 'KeyE': {
          const msg = pointAndClickInteraction();
          addChatMessage(msg);
          break;
        }
        default: break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW': moveForwardRef.current = false; break;
        case 'KeyS': moveBackwardRef.current = false; break;
        case 'KeyA': moveLeftRef.current = false; break;
        case 'KeyD': moveRightRef.current = false; break;
        default: break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [addChatMessage, pointAndClickInteraction]);

  // ----------------------------
  // 5. Initialize Lights
  // ----------------------------
  const initLights = useCallback(() => {
    const scene = sceneRef.current;
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
  }, []);

  // ----------------------------
  // 6. Initialize Post-Processing (Bloom)
  // ----------------------------
  const initPostProcessing = useCallback(() => {
    const composer = new EffectComposer(rendererRef.current);
    const renderPass = new RenderPass(sceneRef.current, cameraRef.current);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;
  }, []);

  // ----------------------------
  // 7. Initialize GUI (dat.gui)
  // ----------------------------
  const initGUI = useCallback(() => {
    const gui = new GUI();
    guiRef.current = gui;
    const studioFolder = gui.addFolder('Studio Settings');
    const params = { brightness: 1.0, contrast: 1.0 };
    studioFolder.add(params, 'brightness', 0, 2).onChange((val) => {
      addChatMessage(`Brightness set to ${val}`);
    });
    studioFolder.add(params, 'contrast', 0, 2).onChange((val) => {
      addChatMessage(`Contrast set to ${val}`);
    });
    studioFolder.open();
  }, [addChatMessage]);

  // ----------------------------
  // 8. Load Desk Model (OBJ + MTL)
  // ----------------------------
  const loadDeskModel = useCallback(() => {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('/models/'); // adjust path if needed
    mtlLoader.load('', (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('/models/'); // adjust path if needed
      objLoader.load(
        'studio.obj',
        (object) => {
          object.scale.set(0.015, 0.01, 0.01);
          object.position.set(0, 0, -6);
          object.name = 'News Desk';
          sceneRef.current.add(object);
          // Register each mesh for collision detection
          object.traverse((child) => {
            if (child.isMesh) {
              collidableMeshList.current.push(child);
            }
          });
        },
        undefined,
        (error) => {
          console.error('Error loading desk model (OBJ/MTL):', error);
        }
      );
    });
  }, []);

  // ----------------------------
  // 9. Add Studio Objects (with collidables)
  // ----------------------------
  const addStudioObjects = useCallback(() => {
    const scene = sceneRef.current;
    // Floor: large fixed plane so you never see the dome's underside.
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Replace placeholder News Desk with custom model via loadDeskModel()
    loadDeskModel();

    // Screen (collidable)
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 4),
      new THREE.MeshStandardMaterial({ color: 0x224488 })
    );
    screen.position.set(-8, 2, -10);
    screen.rotation.y = Math.PI / 6;
    screen.name = 'News Screen';
    scene.add(screen);
    collidableMeshList.current.push(screen);

    // Studio Camera Placeholder (collidable)
    const studioCam = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    studioCam.position.set(8, 1.5, -8);
    studioCam.name = 'Studio Camera';
    scene.add(studioCam);
    collidableMeshList.current.push(studioCam);
  }, [loadDeskModel]);

  // ----------------------------
  // 10. Load Additional Models (for custom props)
  // ----------------------------
  const loadModels = useCallback(() => {
    const loader = new GLTFLoader();
    loader.load(
      '/models/studio_prop.glb',
      (gltf) => {
        gltf.scene.position.set(2, 0, -4);
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            collidableMeshList.current.push(child);
          }
        });
        sceneRef.current.add(gltf.scene);
      },
      undefined,
      (error) => { console.error('Error loading prop model:', error); }
    );
  }, []);

  // ----------------------------
  // 11. Place Custom Models (Placeholder) and register collidables
  // ----------------------------
  const placeCustomModels = useCallback(() => {
    const scene = sceneRef.current;
    const customModel = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff22ff })
    );
    customModel.position.set(-3, 0.5, -4);
    customModel.name = 'Custom Model Placeholder';
    scene.add(customModel);
    collidableMeshList.current.push(customModel);
  }, []);

  // ----------------------------
  // 12. Animation Loop with Collision Checking and Fixed Y Position
  // ----------------------------
  const animate = useCallback(() => {
    requestAnimationFrame(animate);
    const delta = 0.016; // Fixed ~60 FPS

    // Dampen velocity
    velocityRef.current.x -= velocityRef.current.x * 10.0 * delta;
    velocityRef.current.z -= velocityRef.current.z * 10.0 * delta;

    // Update movement direction based on WASD flags
    directionRef.current.z = (moveForwardRef.current ? 1 : 0) - (moveBackwardRef.current ? 1 : 0);
    directionRef.current.x = (moveRightRef.current ? 1 : 0) - (moveLeftRef.current ? 1 : 0);
    directionRef.current.normalize();

    // Movement parameters (adjust these values for your desired speed)
    const acceleration = 100.0;
    const speed = 1.5;
    if (moveForwardRef.current || moveBackwardRef.current) {
      velocityRef.current.z -= directionRef.current.z * acceleration * delta;
    }
    if (moveLeftRef.current || moveRightRef.current) {
      velocityRef.current.x -= directionRef.current.x * acceleration * delta;
    }

    // Compute displacement vector
    const displacement = new THREE.Vector3(
      -velocityRef.current.x * delta,
      0,
      -velocityRef.current.z * delta
    );

    // Compute potential new position
    const currentPos = cameraRef.current.position.clone();
    const potentialPos = currentPos.add(displacement);
    // Clamp Y to a fixed height (1.8)
    potentialPos.y = 1.8;

    // Prevent leaving the dome: ensure within domeInnerRadius
    if (potentialPos.length() <= domeInnerRadius) {
      // Check collisions with collidable objects
      let collision = false;
      const cameraSphere = new THREE.Sphere(potentialPos, cameraColliderRadius);
      collidableMeshList.current.forEach((mesh) => {
        const box = new THREE.Box3().setFromObject(mesh);
        if (box.intersectsSphere(cameraSphere)) {
          collision = true;
        }
      });
      if (!collision) {
        cameraRef.current.position.copy(potentialPos);
      }
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, []);

  // ----------------------------
  // 13. Handle Window Resize
  // ----------------------------
  const onWindowResize = useCallback(() => {
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
    if (composerRef.current) {
      composerRef.current.setSize(width, height);
    }
  }, []);

  // ----------------------------
  // 14. Initialization and Cleanup
  // ----------------------------
  useEffect(() => {
    initScene();
    initCamera();
    initRenderer();
    initControls();
    initLights();
    initPostProcessing();
    initGUI();
    addStudioObjects();
    placeCustomModels();
    loadModels();

    window.addEventListener('resize', onWindowResize);
    animate();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (guiRef.current) guiRef.current.destroy();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current && rendererRef.current.domElement) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [
    initScene,
    initCamera,
    initRenderer,
    initControls,
    initLights,
    initPostProcessing,
    initGUI,
    addStudioObjects,
    placeCustomModels,
    loadModels,
    onWindowResize,
    animate,
  ]);

  // ----------------------------
  // 15. Render UI Overlay (Action Logs & Broadcast Level)
  // ----------------------------
  const renderOverlay = () => {
    return (
      <>
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#00ff00',
          fontSize: '2rem',
          fontWeight: 'bold',
          zIndex: 2,
          textShadow: '0 0 10px rgba(0,255,0,0.8)'
        }}>
          Broadcasting Live – Level {broadcastLevel}
        </div>
        <div ref={chatLogRef} style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          width: 320,
          height: 220,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          zIndex: 2,
          overflowY: 'auto',
          fontSize: '0.9rem'
        }}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Action Logs</div>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '5px' }}>{msg}</div>
          ))}
        </div>
      </>
    );
  };

  // ----------------------------
  // 16. Final Render
  // ----------------------------
  return (
    <div style={{
      position: 'fixed',
      width: '100vw',
      height: '100vh',
      top: 0,
      left: 0,
      overflow: 'hidden'
    }}>
      {loading && (
        <div style={{
          position: 'absolute',
          zIndex: 999,
          width: '100vw',
          height: '100vh',
          background: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          Loading... {loadingProgress}%
        </div>
      )}
      {renderOverlay()}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

/* =====================================================
   Helper Classes and Functions (Declared Only Once)
   ===================================================== */

// BroadcastingLoadingScreen – Loading overlay component.
export function BroadcastingLoadingScreen({ progress }) {
  return (
    <div style={{
      position: 'absolute',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      top: 0,
      left: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h2>Loading... {progress}%</h2>
    </div>
  );
}

// The following helper classes remain unchanged and are declared only once.

export class BroadcastingInventory {
  constructor() { this.items = []; }
  addItem(name, quantity = 1) {
    const existing = this.items.find(item => item.name === name);
    if (existing) { existing.quantity += quantity; }
    else { this.items.push({ name, quantity }); }
  }
  removeItem(name, quantity = 1) {
    const idx = this.items.findIndex(item => item.name === name);
    if (idx !== -1) {
      this.items[idx].quantity -= quantity;
      if (this.items[idx].quantity <= 0) this.items.splice(idx, 1);
    }
  }
  listItems() { return this.items.map(item => `${item.name} x${item.quantity}`).join(', '); }
}

export class BroadcastingScoreboard {
  constructor() { this.scores = {}; }
  addPlayer(name) { if (!this.scores[name]) this.scores[name] = 0; }
  addScore(name, amount) { if (!this.scores[name]) this.addPlayer(name); this.scores[name] += amount; }
  getScore(name) { return this.scores[name] || 0; }
  listScores() { return Object.entries(this.scores).map(([name, score]) => `${name}: ${score}`).join('\n'); }
}

export class BroadcastingStateMachine {
  constructor() { this.current = null; }
  changeState(newState) { this.current = newState; return `State changed to ${newState}`; }
}

export class BroadcastingAI {
  constructor(name = 'BroadcastBot') { this.name = name; this.state = 'idle'; }
  greet() { return `Hello, I am ${this.name}. How can I help you?`; }
  helpTask(task) { this.state = 'helping'; return `${this.name} is now helping with ${task}.`; }
  idle() { this.state = 'idle'; return `${this.name} is idle.`; }
}

export class BroadcastingNetwork {
  constructor(serverUrl) { this.serverUrl = serverUrl; this.connected = false; }
  connect() { this.connected = true; return `Connected to ${this.serverUrl}`; }
  disconnect() { this.connected = false; return `Disconnected from ${this.serverUrl}`; }
  sendMessage(msg) { if (!this.connected) return 'Not connected'; return `Message sent: ${msg}`; }
}

export class BroadcastingEffects {
  constructor() { this.currentEffect = null; }
  fadeIn(duration = 1.0) { this.currentEffect = `Fading in over ${duration}s`; return this.currentEffect; }
  fadeOut(duration = 1.0) { this.currentEffect = `Fading out over ${duration}s`; return this.currentEffect; }
  clear() { this.currentEffect = null; return 'Effects cleared'; }
}

export class BroadcastingEventSystem {
  constructor() { this.listeners = {}; }
  on(event, callback) { if (!this.listeners[event]) this.listeners[event] = []; this.listeners[event].push(callback); }
  emit(event, payload) { if (this.listeners[event]) { this.listeners[event].forEach(callback => callback(payload)); } }
}

export class BroadcastingAudioManager {
  constructor() { this.sounds = {}; this.volume = 0.5; }
  loadSound(name, url) { const audio = new Audio(url); audio.volume = this.volume; this.sounds[name] = audio; }
  playSound(name, loop = false) { if (this.sounds[name]) { this.sounds[name].loop = loop; this.sounds[name].play(); return `Playing sound ${name}`; } return `Sound ${name} not found`; }
  stopSound(name) { if (this.sounds[name]) { this.sounds[name].pause(); this.sounds[name].currentTime = 0; return `Stopped sound ${name}`; } return `Sound ${name} not found`; }
  setVolume(vol) { this.volume = vol; Object.values(this.sounds).forEach(audio => (audio.volume = vol)); return `Volume set to ${vol}`; }
}

export class BroadcastingCollision {
  static check(objA, objB, radiusA = 1, radiusB = 1) { return objA.position.distanceTo(objB.position) < (radiusA + radiusB); }
}

export class BroadcastingSceneLoader {
  load(jsonData, scene) {
    jsonData.objects.forEach(obj => {
      const geo = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshStandardMaterial({ color: obj.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(obj.x, obj.y, obj.z);
      scene.add(mesh);
    });
    return 'Scene loaded';
  }
}

export class BroadcastingAnimationSystem {
  constructor() { this.animations = []; }
  addAnimation(mesh, prop, fromValue, toValue, duration) {
    this.animations.push({ mesh, prop, fromValue, toValue, duration, elapsed: 0 });
  }
  update(delta) {
    this.animations.forEach(anim => {
      anim.elapsed += delta;
      const t = Math.min(anim.elapsed / anim.duration, 1);
      anim.mesh[anim.prop] = THREE.MathUtils.lerp(anim.fromValue, anim.toValue, t);
    });
    this.animations = this.animations.filter(anim => anim.elapsed < anim.duration);
  }
}

export class BroadcastingStoryManager {
  constructor() {
    this.steps = [
      'Welcome to the studio. Set up your equipment.',
      'Troubleshoot the camera feed.',
      'Go live and interact with the audience.'
    ];
    this.currentStep = 0;
  }
  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      return this.steps[this.currentStep];
    }
    return 'Story complete';
  }
  currentStepText() { return this.steps[this.currentStep]; }
}

export class BroadcastingHUD {
  constructor() { this.messages = []; }
  addMessage(msg) { this.messages.push(msg); }
  clear() { this.messages = []; }
  render() { return this.messages.join('\n'); }
}

export class BroadcastingSaveSystem {
  save(key, data) { localStorage.setItem(key, JSON.stringify(data)); return `Saved under ${key}`; }
  load(key) { return JSON.parse(localStorage.getItem(key)); }
  clear(key) { localStorage.removeItem(key); return `Cleared ${key}`; }
}

export class BroadcastingVRSupport {
  constructor(renderer) { this.renderer = renderer; }
  enableVR() { this.renderer.xr.enabled = true; return 'VR enabled'; }
  disableVR() { this.renderer.xr.enabled = false; return 'VR disabled'; }
}

export class BroadcastingPerformance {
  constructor() { this.lastTime = performance.now(); this.fps = 0; }
  update() { const now = performance.now(); this.fps = 1000 / (now - this.lastTime); this.lastTime = now; }
  getFPS() { return this.fps.toFixed(2); }
}

export class BroadcastingLocalization {
  constructor() {
    this.lang = 'en';
    this.translations = {
      en: { welcome: 'Welcome to the Broadcasting Studio!' },
      ro: { welcome: 'Bun venit la Studioul de Broadcasting!' }
    };
  }
  setLanguage(lang) { this.lang = lang; }
  t(key) { return this.translations[this.lang][key] || key; }
}

export async function broadcastHTTP(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

export class BroadcastingMaterialFactory {
  static createMetalMaterial(color = 0x888888) { return new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: 0.3 }); }
  static createPlasticMaterial(color = 0xff0000) { return new THREE.MeshStandardMaterial({ color, metalness: 0, roughness: 0.5 }); }
  static createGlassMaterial(color = 0xffffff) {
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0,
      transmission: 1,
      thickness: 0.5,
    });
  }
}

export const BroadcastingKeyMap = {
  forward: 'KeyW',
  backward: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  interact: 'KeyE'
};

export class BroadcastingScenarioManager {
  constructor() { this.currentScenario = 'level1'; }
  setScenario(name) { this.currentScenario = name; }
  getScenario() { return this.currentScenario; }
}

export class BroadcastingAchievementSystem {
  constructor() { this.achievements = []; }
  unlock(name) { if (!this.achievements.includes(name)) this.achievements.push(name); }
  listAchievements() { return this.achievements; }
}

export class BroadcastingTimeOfDay {
  constructor(scene) { this.scene = scene; this.hour = 12; }
  setTime(hour) { this.hour = hour; }
}

export class BroadcastingInteractionSystem {
  constructor(camera, scene, range = 2) { this.camera = camera; this.scene = scene; this.range = range; }
  interact() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersects = raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length > 0 && intersects[0].distance < this.range) {
      return `Interacted with ${intersects[0].object.name}`;
    }
    return 'Nothing to interact with';
  }
}

export class BroadcastingVehicle {
  constructor() { this.mesh = null; this.speed = 0; }
  createMesh() {
    const geo = new THREE.BoxGeometry(2, 1, 4);
    const mat = BroadcastingMaterialFactory.createMetalMaterial();
    this.mesh = new THREE.Mesh(geo, mat);
  }
  update(delta) { if (this.mesh) { this.mesh.position.z -= this.speed * delta; } }
}

export class BroadcastingLogic {
  constructor() { this.state = 'init'; }
  updateState(newState) { this.state = newState; return `State changed to ${newState}`; }
}

export class BroadcastingCommandSystem {
  constructor() {
    this.commands = {
      help: () => 'Commands: help, greet, version',
      greet: () => 'Hello from BroadcastingCommandSystem!',
      version: () => 'v1.0.0'
    };
  }
  execute(cmd) { return this.commands[cmd] ? this.commands[cmd]() : `Unknown command: ${cmd}`; }
}

export class BroadcastingSubtitleSystem {
  constructor() { this.subtitles = []; }
  addSubtitle(text, duration) { this.subtitles.push({ text, duration, time: 0 }); }
  update(delta) { this.subtitles.forEach(s => s.time += delta); this.subtitles = this.subtitles.filter(s => s.time < s.duration); }
  getActiveSubtitles() { return this.subtitles.map(s => s.text).join('\n'); }
}

export class BroadcastingAnalytics {
  constructor() { this.events = []; }
  logEvent(name, data) { this.events.push({ name, data, timestamp: Date.now() }); }
  getEvents() { return this.events; }
  clearEvents() { this.events = []; }
}

export class BroadcastingVideoMixer {
  constructor() { this.channels = ['Camera1', 'Camera2']; this.activeChannel = 'Camera1'; }
  switchChannel(channel) { if (this.channels.includes(channel)) { this.activeChannel = channel; return `Switched to ${channel}`; } return `Channel ${channel} not found`; }
}

export class BroadcastingAudioMixer {
  constructor() { this.channels = { mic: 1.0, background: 0.5 }; }
  setVolume(channel, vol) { if (this.channels[channel] !== undefined) { this.channels[channel] = vol; return `Volume of ${channel} set to ${vol}`; } return `Channel ${channel} not found`; }
  getVolume(channel) { return this.channels[channel] || 0; }
}

export class BroadcastingControlPanel {
  constructor() { this.params = { brightness: 1.0, contrast: 1.0 }; }
  setParam(name, value) { if (this.params[name] !== undefined) { this.params[name] = value; return `Set ${name} to ${value}`; } return `Param ${name} not found`; }
  getParam(name) { return this.params[name]; }
}

export class BroadcastingDiagnostics {
  constructor() { this.fps = 0; this.memoryUsed = 0; }
  update(delta) { this.fps = 1 / delta; this.memoryUsed = (window.performance && window.performance.memory) ? window.performance.memory.usedJSHeapSize : 0; }
  report() { return `FPS: ${this.fps.toFixed(2)}, Memory: ${this.memoryUsed} bytes`; }
}

export class BroadcastingCollisionSystem {
  constructor() { this.objects = []; }
  addObject(mesh, radius = 1) { this.objects.push({ mesh, radius }); }
  checkCollisions() {
    const collisions = [];
    for (let i = 0; i < this.objects.length; i++) {
      for (let j = i + 1; j < this.objects.length; j++) {
        const d = this.objects[i].mesh.position.distanceTo(this.objects[j].mesh.position);
        if (d < this.objects[i].radius + this.objects[j].radius) {
          collisions.push([this.objects[i].mesh, this.objects[j].mesh]);
        }
      }
    }
    return collisions;
  }
}


