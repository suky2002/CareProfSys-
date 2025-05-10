import { useEffect, useRef } from "react";

import Marzipano from "marzipano";

export default function MarzipanoViewer({ image, hotspots = [], onHotspotClick }) {
  const viewerRef = useRef(null);
  const marzipanoViewerRef = useRef(null);
  const hotspotElementsRef = useRef([]);

  useEffect(() => {
    if (!viewerRef.current || marzipanoViewerRef.current) return;

    const viewer = new Marzipano.Viewer(viewerRef.current);
    marzipanoViewerRef.current = viewer;

    const source = Marzipano.ImageUrlSource.fromString(image);
    const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);
    const view = new Marzipano.RectilinearView();
    const scene = viewer.createScene({ source, geometry, view });

    scene.switchTo();
    viewer.setIdleMovement(3000, Marzipano.autorotate({ yawSpeed: 0.05 }));
    viewer.scene = scene;
  }, [image]);

  useEffect(() => {
    const viewer = marzipanoViewerRef.current;
    if (!viewer || !viewer.scene) return;

    const hotspotContainer = viewer.scene.hotspotContainer();

    // Șterge toate hotspoturile vechi din DOM
    hotspotElementsRef.current.forEach(el => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    hotspotElementsRef.current = [];

    // Creează hotspoturile noi
    hotspots.forEach(hotspot => {
      const element = document.createElement("div");
      element.style.width = "48px";
      element.style.height = "48px";
      element.style.backgroundImage = "url('/assets/icons/info.png')";
      element.style.backgroundSize = "contain";
      element.style.backgroundRepeat = "no-repeat";
      element.style.backgroundPosition = "center";
      element.style.position = "absolute";
      element.style.transform = "translate(-50%, -50%)";
      element.style.cursor = "pointer";
      element.onclick = () => onHotspotClick(hotspot);

      hotspotContainer.createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      hotspotElementsRef.current.push(element);
    });
  }, [hotspots, onHotspotClick]);

  return <div ref={viewerRef} className="w-full h-full" />;
}
