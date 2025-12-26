'use client';
import { useEffect, useRef, useState } from 'react';
import { Sea } from './classes/Sea';
import { Sky } from './classes/Sky';
import { AirPlane } from './classes/Airplane';
import { createScene, createLights } from './utils/scene';

export default function PlaneDemo() {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const viewport = {
    width: dimensions.width,
    height: dimensions.height,
    camera: {
      fov: 60,
      near: 1,
      far: 10000,
      position: { x: 0, y: 100, z: 200 }
    }
  };

  // container dimensions settings
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: rect.height
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const { scene, camera, renderer } = createScene(viewport, containerRef.current);
    const lights = createLights(scene);

    // Create objects
    const airplane = new AirPlane();
    airplane.mesh.scale.set(.25, .25, .25);
    airplane.mesh.position.y = 100;
    scene.add(airplane.mesh);

    const sea = new Sea();
    sea.mesh.position.y = -600;
    scene.add(sea.mesh);

    const sky = new Sky();
    sky.mesh.position.y = -600;
    scene.add(sky.mesh);

    // Animation loop
    function loop() {
      airplane.propeller.rotation.x += 0.3;
      sea.mesh.rotation.z += .005;
      sky.mesh.rotation.z += .01;

      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }

    loop();
    setLoaded(true);

    // renderer dimensions settings
    const handleResize = () => {
      renderer.setSize(viewport.width, viewport.height);
      camera.aspect = viewport.width / viewport.height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [viewport]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="plane-demo">
      <div
        ref={containerRef}
        className="rounded relative w-full h-[600px] overflow-hidden bg-gradient-to-b from-[#7dcbff] to-[#f7d9aa] mx-auto"
      >
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-4 right-4 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>
      </div>
      {!loaded && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">Loading...</div>}
    </div>
  );
}