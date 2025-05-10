import { useEffect, useState } from "react";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export default function ModelViewer({ modelPath, position, scale }) {
  const [object, setObject] = useState(null);

  useEffect(() => {
    if (!modelPath) return;

    const extension = modelPath.split(".").pop().toLowerCase();
    const basePath = modelPath.substring(0, modelPath.lastIndexOf("/"));
    const fileName = modelPath.split("/").pop().replace(`.${extension}`, "");

    if (extension === "glb") {
      new GLTFLoader().load(modelPath, (gltf) => {
        setObject(gltf.scene);
      });
    }

    if (extension === "obj") {
      const mtlLoader = new MTLLoader();
      mtlLoader.setPath(`${basePath}/`);
      mtlLoader.load(`${fileName}.mtl`, (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(`${basePath}/`);
        objLoader.load(`${fileName}.obj`, (obj) => {
          setObject(obj);
        });
      });
    }
  }, [modelPath]);

  return object ? <primitive object={object} scale={scale} position={position} /> : null;
}
