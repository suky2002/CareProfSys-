import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GUI } from 'dat.gui';
import { TaskSystem, useTaskSystem } from './TaskSystem';

export default function EnvironmentThreeScene() {
  // Add task system hook and state
  const { tasks, completeTask, resetTasks } = useTaskSystem();
  const [completedTasks, setCompletedTasks] = useState(new Set());

  // Refs for THREE.js objects and DOM elements
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

  // Movement flags and vectors (WASD)
  const moveForwardRef = useRef(false);
  const moveBackwardRef = useRef(false);
  const moveLeftRef = useRef(false);
  const moveRightRef = useRef(false);
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const directionRef = useRef(new THREE.Vector3(0, 0, 0));

  // UI State
  const [chatMessages, setChatMessages] = useState([]);
  const [broadcastLevel, setBroadcastLevel] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Collision parameters
  const cameraColliderRadius = 0.3; // Reduce from 0.5 to 0.3
  const domeInnerRadius = 490; // Limit for camera movement inside the dome

  // Helper: add a chat message (Action Logs)
  const addChatMessage = useCallback((msg) => {
    setChatMessages((prev) => [...prev, msg]);
  }, []);

  // Add task completion handler
  const handleTaskCompletion = useCallback((taskId) => {
    if (!completedTasks.has(taskId)) {
      completeTask(taskId);
      setCompletedTasks(prev => new Set([...prev, taskId]));
      addChatMessage(`Task ${taskId} completed!`);
    }
  }, [completeTask, completedTasks, addChatMessage]);

  // Add task checking to interaction system

  const showRobotInstructions = useCallback(() => {
    const robot = sceneRef.current.getObjectByName('Robot');
    if (robot) {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Make background more visible
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add instructions text
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Acestea sunt instrucțiunile robotului!", canvas.width/2, 40);
        ctx.font = '16px Arial';
        ctx.fillText("Apasă tasta 'E' din nou pentru a închide.", canvas.width/2, 80);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const chatBubble = new THREE.Sprite(spriteMaterial);
        chatBubble.scale.set(4, 2, 1);
        chatBubble.position.set(3, 2.5, 0); // Adjusted height
        
        const oldBubble = robot.getObjectByName('ChatBubble');
        if (oldBubble) robot.remove(oldBubble);
        chatBubble.name = 'ChatBubble';

        collidableMeshList.current.push(chatBubble);
        robot.add(chatBubble);
  
        // Position camera directly in front of robot with better angle
        const robotPos = robot.position.clone();
        const distance = 3; // Closer to robot
        const height = 1.8; // Eye level
        
        // Calculate position in front of robot considering its rotation
        const angle = robot.rotation.y;
        const newCamPos = new THREE.Vector3(
            robotPos.x + Math.sin(angle) * distance,
            height,
            robotPos.z + Math.cos(angle) * distance
        );
        
        cameraRef.current.position.copy(newCamPos);
        cameraRef.current.lookAt(new THREE.Vector3(robotPos.x, height, robotPos.z));
  
        addChatMessage("Robot: Acestea sunt instrucțiunile mele! Apasă E pentru a închide.");
        handleTaskCompletion(5);
    }
}, [addChatMessage, handleTaskCompletion]);

  const checkTaskCompletion = useCallback((interactedObject) => {
    switch(interactedObject.name) {
      case 'News Desk':
        handleTaskCompletion(1); // Setup workspace task
        break;
      case 'Studio Camera Placeholder':
        handleTaskCompletion(2); // Check camera equipment
        break;
      case 'Robot':
        handleTaskCompletion(3); // Interact with robot
        break;
      case 'News Screen':
        handleTaskCompletion(4); // Check broadcast screen
        break;
      default:
        break;
    }
  }, [handleTaskCompletion]);

  // Helper: Point-and-Click Interaction (Raycasting)
  const pointAndClickInteraction = useCallback(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0);
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    
    if (intersects.length > 0) {
        const target = intersects[0].object;
        
        // Check if we clicked on the chat bubble
        if (target.name === 'ChatBubble') {
            const robot = sceneRef.current.getObjectByName('Robot');
            if (robot) {
                const bubble = robot.getObjectByName('ChatBubble');
                if (bubble) {
                    robot.remove(bubble);
                    collidableMeshList.current = collidableMeshList.current.filter(obj => obj !== bubble);
                    addChatMessage("Robot: Mulțumesc pentru interacțiune!");
                    
                    // Re-lock controls if they were unlocked
                    if (!controlsRef.current.isLocked) {
                        controlsRef.current.lock();
                    }
                    
                    return "Closed robot instructions";
                }
            }
        }

        checkTaskCompletion(target);
        if (target.userData && target.userData.message) {
            showRobotInstructions();
            // Make sure controls stay locked after showing instructions
            if (!controlsRef.current.isLocked) {
                controlsRef.current.lock();
            }
            return target.userData.message;
        }
        return `Interacted with ${target.name || 'an object'}.`;
    }
    return 'Nothing to interact with.';
}, [checkTaskCompletion, showRobotInstructions, addChatMessage]);

  

  // Auto-scroll Action Logs on new messages
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Disable page scroll for full-screen experience
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // 1. Initialize Scene (with Dome Background)
  const initScene = useCallback(() => {
    const scene = new THREE.Scene();
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

  // 2. Initialize Camera
  const initCamera = useCallback(() => {
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(0, 1.8, 5);
    cameraRef.current = camera;
  }, []);

  // 3. Initialize Renderer & VRButton
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

  // 4. Initialize Controls & Keyboard Input
  const initControls = useCallback(() => {
    const camera = cameraRef.current;
    const domElement = rendererRef.current.domElement;
    const controls = new PointerLockControls(camera, domElement);
    
    controls.addEventListener('lock', () => {
      addChatMessage('Controls locked. Use WASD to move and E to interact.');
    });
    
    controls.addEventListener('unlock', () => {
      addChatMessage('Controls unlocked. Click to resume.');
    });
    
    controlsRef.current = controls;

    // Modified click handler
    const onClick = (event) => {
      event.preventDefault(); // Prevent default browser behavior
      if (!controls.isLocked) {
        controls.lock();
      }
    };

    // Use mousedown instead of click
    domElement.addEventListener('click', onClick);

    return () => {
      domElement.removeEventListener('click', onClick);
    };
}, [addChatMessage]);

  // 5. Initialize Lights
  const initLights = useCallback(() => {
    const scene = sceneRef.current;
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
  }, []);

  // 6. Initialize Post-Processing (Bloom)
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

  // 7. Initialize GUI (dat.gui)
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

  // 8. Load Desk Model (OBJ + MTL)
  const loadDeskModel = useCallback(() => {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('/Imagini/'); // Adjust the path as needed
    // Replace 'black_wood.jpeg' with the correct MTL file for your desk model
    mtlLoader.load('black_wood.mtl', (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('/models/'); // Adjust path as needed
      // Replace 'studio.obj' with your desk model's OBJ file name
      objLoader.load(
        'studio.obj',
        (object) => {
          object.scale.set(0.013, 0.01, 0.01);
          object.position.set(0, 0, -6);
          object.name = 'News Desk';
          sceneRef.current.add(object);
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

  // 9. Load Camera Model (OBJ + MTL)
  const cameraObject = useCallback(() => {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('/models/'); // Adjust path as needed
    mtlLoader.load('camera.mtl', (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('/models/'); // Adjust path as needed
      objLoader.load(
        'uploads_files_2423186_old+school+camera+nd+projector+obj+file.obj', // Replace with your camera model's OBJ file name
        (object) => {
          object.scale.set(0.2, 0.2, 0.4);
          object.position.set(5, 0, 1);
          object.rotation.y = (Math.PI / 2);
          object.name = 'Studio Camera Placeholder';
          sceneRef.current.add(object);
          object.traverse((child) => {
            if (child.isMesh) {
              collidableMeshList.current.push(child);
            }
          });
        },
        undefined,
        (error) => {
          console.error('Error loading camera model (OBJ/MTL):', error);
        }
      );
    });
  }, []);

  const studioChairFBX = useCallback(() => {
      const fbxLoader = new FBXLoader();
      fbxLoader.setPath('/models/Desk Chair/'); // Adjust path as needed
      fbxLoader.load(
        'Desk Chair.fbx', // Replace with your camera model's OBJ file name
        (object) => {
          object.scale.set(1.5, 1.5, 2);
          object.position.set(0, 0, -6);
          object.rotation.y = -(Math.PI);
          object.name = 'Studio Chair';
          sceneRef.current.add(object);
          object.traverse((child) => {
            if (child.isMesh) {
              collidableMeshList.current.push(child);
            }
          });
        },
        undefined,
        (error) => {
          console.error('Error loading chair model (FBX):', error);
        }
      );
  }, []);


  const addRobotWithHotspot = useCallback(() => {
    const fbxLoader = new FBXLoader();
    fbxLoader.setPath('/models/Robot/'); // Ajustează calea după nevoie
    fbxLoader.load(
      'robot.fbx', // Numele fișierului FBX al robotului
      (robot) => {
        robot.scale.set(0.5, 0.5, 0.5);
        // Poziționează robotul între pupitru și ecranul de știri (ajustează după necesitate)
        robot.position.set(-4, 0, -8);
        robot.rotation.y = -Math.PI / 2;
        robot.name = 'Robot';
        sceneRef.current.add(robot);
        robot.traverse((child) => {
          if (child.isMesh) {
            collidableMeshList.current.push(child);
          }
        });

        // Crează hotspot-ul: un plan cu litera "E"
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'Bold 100px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E', canvas.width / 2, canvas.height / 2);
        const hotspotTexture = new THREE.CanvasTexture(canvas);
        const hotspotMaterial = new THREE.MeshBasicMaterial({ map: hotspotTexture, transparent: true });
        const hotspotGeometry = new THREE.PlaneGeometry(2, 2);
        const hotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
        hotspot.name = 'Hotspot';
        // Poziționează hotspot-ul deasupra capului robotului (ajustează Y după necesitate)
        hotspot.position.set(3, 2, 0);
        hotspot.rotateY(Math.PI / 2);
        hotspot.userData.message = 'Interact with Robot';
        robot.add(hotspot);
      },
      undefined,
      (error) => {
        console.error('Error loading robot FBX:', error);
      }
    );
  }, []);



  // 10. Add Studio Objects (with collidables)
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

    // Load the desk model to replace the placeholder
    loadDeskModel();

    // Load the camera model
    cameraObject();

    studioChairFBX();

    addRobotWithHotspot();


    const textureLoader = new THREE.TextureLoader();
    const screenTexture = textureLoader.load('/Imagini/weather.jpg'); // Asigură-te că fișierul există la această cale
    const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture });
    const screenGeometry = new THREE.PlaneGeometry(8, 5);
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(-9, 2, -10);
    screen.rotation.y = Math.PI / 6;
    screen.name = 'News Screen';
    scene.add(screen);
    collidableMeshList.current.push(screen);



    // Studio Camera Placeholder (if needed, as extra collidable)
    const studioCam = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    studioCam.position.set(8, 1.5, -8);
    studioCam.name = 'Studio Camera Placeholder';
   
    collidableMeshList.current.push(studioCam);
  }, [loadDeskModel, cameraObject, studioChairFBX, addRobotWithHotspot]);

  // 11. Load Additional Models (for custom props)
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

  // 12. Place Custom Models (Placeholder) and register collidables
  const placeCustomModels = useCallback(() => {
    const scene = sceneRef.current;
    const customModel = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff22ff })
    );
    customModel.position.set(-3, 0.5, -4);
    customModel.name = 'Custom Model Placeholder';
    
    collidableMeshList.current.push(customModel);
  }, []);

  // 13. Animation Loop with Collision Checking and Fixed Y Position
  const animate = useCallback(() => {
    if (!mountRef.current) return;

    const animateFrame = () => {
        const delta = 0.016;

        if (controlsRef.current?.isLocked) {
            // Update velocity with damping
            velocityRef.current.x -= velocityRef.current.x * 10.0 * delta;
            velocityRef.current.z -= velocityRef.current.z * 10.0 * delta;

            // Get movement direction
            directionRef.current.z = Number(moveForwardRef.current) - Number(moveBackwardRef.current);
            directionRef.current.x = Number(moveRightRef.current) - Number(moveLeftRef.current);
            directionRef.current.normalize();

            // Apply movement in camera direction
            if (moveForwardRef.current || moveBackwardRef.current) {
                velocityRef.current.z -= directionRef.current.z * 50.0 * delta;
            }
            if (moveLeftRef.current || moveRightRef.current) {
                velocityRef.current.x -= directionRef.current.x * 50.0 * delta;
            }

            // Apply movement relative to camera direction
            const cameraDirection = new THREE.Vector3();
            cameraRef.current.getWorldDirection(cameraDirection);
            cameraDirection.y = 0;
            cameraDirection.normalize();

            const sideways = new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x);
            
            const moveX = velocityRef.current.x * delta;
            const moveZ = velocityRef.current.z * delta;

            const forward = cameraDirection.multiplyScalar(moveZ);
            const side = sideways.multiplyScalar(moveX);

            const movement = new THREE.Vector3()
                .addVectors(forward, side);

            // Apply movement if no collision
            const newPosition = cameraRef.current.position.clone().add(movement);
            newPosition.y = 1.8; // Keep fixed height

            // Check bounds and collisions
            if (newPosition.length() <= domeInnerRadius) {
                let collision = false;
                const cameraSphere = new THREE.Sphere(newPosition, cameraColliderRadius);
                
                collidableMeshList.current.forEach((mesh) => {
                    if (!mesh) return;
                    const box = new THREE.Box3().setFromObject(mesh);
                    if (box.intersectsSphere(cameraSphere)) {
                        const meshCenter = new THREE.Vector3();
                        box.getCenter(meshCenter);
                        const distance = newPosition.distanceTo(meshCenter);
                        if (distance < 1.5) {
                            collision = true;
                        }
                    }
                });

                if (!collision) {
                    cameraRef.current.position.copy(newPosition);
                }
            }
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        requestAnimationFrame(animateFrame);
    };

    requestAnimationFrame(animateFrame);
}, []);

  // 14. Handle Window Resize
  const onWindowResize = useCallback(() => {
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  // 15. Initialization and Cleanup
  useEffect(() => {
    // ... existing initialization code ...

    let mounted = true;
    
    if (mounted) {
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
    }

    return () => {
        mounted = false;
        window.removeEventListener('resize', onWindowResize);
        if (controlsRef.current) {
            controlsRef.current.unlock();
        }
        if (guiRef.current) {
            guiRef.current.destroy();
        }
        if (rendererRef.current) {
            rendererRef.current.dispose();
            if (mountRef.current && rendererRef.current.domElement) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
        }
    };
}, [initScene, initCamera, initRenderer, initControls, initLights, initPostProcessing, initGUI, addStudioObjects, placeCustomModels, loadModels, onWindowResize, animate]);

  // Add task reset on component mount
  useEffect(() => {
    resetTasks();
  }, [resetTasks]);

  // Add keyboard event handlers in the useEffect after initControls
  useEffect(() => {
    const handleKeyDown = (event) => {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                moveForwardRef.current = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                moveBackwardRef.current = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                moveLeftRef.current = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                moveRightRef.current = true;
                break;
            case 'KeyE':
                pointAndClickInteraction();
                break;
        }
    };

    const handleKeyUp = (event) => {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                moveForwardRef.current = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                moveBackwardRef.current = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                moveLeftRef.current = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                moveRightRef.current = false;
                break;
        }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
}, [pointAndClickInteraction]);

  // 16. UI Overlay (Action Logs & Broadcast Level)
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
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
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
          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Tasks</div>
          {tasks.map((task) => (
            <div 
              key={task.id} 
              style={{
                marginBottom: '5px',
                color: completedTasks.has(task.id) ? '#00ff00' : 'white',
                textDecoration: completedTasks.has(task.id) ? 'line-through' : 'none'
              }}
            >
              {task.description}
            </div>
          ))}
        </div>
      </>
    );
  };

  // 17. Final Render
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
      anim.mesh[anim.prop] = THREE.MathUtils.lerp(anim.fromValue, toValue, t);
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
      taskSystem.completeTask(6);
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



