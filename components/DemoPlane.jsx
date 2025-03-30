'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function DemoPlane() {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  let scene, camera, renderer;
  let hemisphereLight, shadowLight;
  let sea, sky, airplane;

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

  const Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xF5986E,
    brownDark: 0x23190f,
    blue: 0x68c3c0,
  };

  function handleWindowResize() {
    renderer.setSize(viewport.width, viewport.height);
    camera.aspect = viewport.width / viewport.height;
    camera.updateProjectionMatrix();
  }

  function createScene() {
    // Create the scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    // Create the camera using viewport config
    const aspectRatio = viewport.width / viewport.height;
    camera = new THREE.PerspectiveCamera(
      viewport.camera.fov,
      aspectRatio,
      viewport.camera.near,
      viewport.camera.far
    );

    // Set camera position from config
    camera.position.set(
      viewport.camera.position.x,
      viewport.camera.position.y,
      viewport.camera.position.z
    );

    // Create the renderer
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    renderer.setSize(viewport.width, viewport.height);
    renderer.shadowMap.enabled = true;

    containerRef.current.appendChild(renderer.domElement);
    window.addEventListener('resize', handleWindowResize);
  }

  function createLights() {
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(150, 350, 350);
    shadowLight.castShadow = true;

    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    scene.add(hemisphereLight);
    scene.add(shadowLight);
  }

  // Sea class
  class Sea {
    constructor() {
      const geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
      geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2));

      const mat = new THREE.MeshPhongMaterial({
        color: Colors.blue,
        transparent: true,
        opacity: .6,
        flatShading: true,
      });

      this.mesh = new THREE.Mesh(geom, mat);
      this.mesh.receiveShadow = true;
    }
  }

  function createSea() {
    sea = new Sea();
    sea.mesh.position.y = -600;
    scene.add(sea.mesh);
  }

  // Cloud class
  class Cloud {
    constructor() {
      this.mesh = new THREE.Object3D();

      const geom = new THREE.BoxGeometry(20, 20, 20);
      const mat = new THREE.MeshPhongMaterial({
        color: Colors.white,
      });

      const nBlocs = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < nBlocs; i++) {
        const m = new THREE.Mesh(geom, mat);

        m.position.x = i * 15;
        m.position.y = Math.random() * 10;
        m.position.z = Math.random() * 10;
        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;

        const s = .1 + Math.random() * .9;
        m.scale.set(s, s, s);

        m.castShadow = true;
        m.receiveShadow = true;

        this.mesh.add(m);
      }
    }
  }

  // Sky class
  class Sky {
    constructor() {
      this.mesh = new THREE.Object3D();
      this.nClouds = 20;

      const stepAngle = Math.PI * 2 / this.nClouds;

      for (let i = 0; i < this.nClouds; i++) {
        const c = new Cloud();

        const a = stepAngle * i;
        const h = 750 + Math.random() * 200;

        c.mesh.position.y = Math.sin(a) * h;
        c.mesh.position.x = Math.cos(a) * h;
        c.mesh.rotation.z = a + Math.PI / 2;
        c.mesh.position.z = -400 - Math.random() * 400;

        const s = 1 + Math.random() * 2;
        c.mesh.scale.set(s, s, s);

        this.mesh.add(c.mesh);
      }
    }
  }

  function createSky() {
    sky = new Sky();
    sky.mesh.position.y = -600;
    scene.add(sky.mesh);
  }

  // Airplane class
  class AirPlane {
    constructor() {
      this.mesh = new THREE.Object3D();

      // Cockpit
      const geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
      const matCockpit = new THREE.MeshPhongMaterial({
        color: Colors.red,
        flatShading: true
      });
      const cockpit = new THREE.Mesh(geomCockpit, matCockpit);
      cockpit.castShadow = true;
      cockpit.receiveShadow = true;
      this.mesh.add(cockpit);

      // Engine
      const geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
      const matEngine = new THREE.MeshPhongMaterial({
        color: Colors.white,
        flatShading: true
      });
      const engine = new THREE.Mesh(geomEngine, matEngine);
      engine.position.x = 40;
      engine.castShadow = true;
      engine.receiveShadow = true;
      this.mesh.add(engine);

      // Tail
      const geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
      const matTailPlane = new THREE.MeshPhongMaterial({
        color: Colors.red,
        flatShading: true
      });
      const tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
      tailPlane.position.set(-35, 25, 0);
      tailPlane.castShadow = true;
      tailPlane.receiveShadow = true;
      this.mesh.add(tailPlane);

      // Wing
      const geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
      const matSideWing = new THREE.MeshPhongMaterial({
        color: Colors.red,
        flatShading: true
      });
      const sideWing = new THREE.Mesh(geomSideWing, matSideWing);
      sideWing.castShadow = true;
      sideWing.receiveShadow = true;
      this.mesh.add(sideWing);

      // Propeller
      const geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
      const matPropeller = new THREE.MeshPhongMaterial({
        color: Colors.brown,
        flatShading: true
      });
      this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
      this.propeller.castShadow = true;
      this.propeller.receiveShadow = true;

      // Blades
      const geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
      const matBlade = new THREE.MeshPhongMaterial({
        color: Colors.brownDark,
        flatShading: true
      });

      const blade = new THREE.Mesh(geomBlade, matBlade);
      blade.position.set(8, 0, 0);
      blade.castShadow = true;
      blade.receiveShadow = true;
      this.propeller.add(blade);
      this.propeller.position.set(50, 0, 0);
      this.mesh.add(this.propeller);
    }
  }

  function createPlane() {
    airplane = new AirPlane();
    airplane.mesh.scale.set(.25, .25, .25);
    airplane.mesh.position.y = 100;
    scene.add(airplane.mesh);
  }

  function loop() {
    airplane.propeller.rotation.x += 0.3;
    sea.mesh.rotation.z += .005;
    sky.mesh.rotation.z += .01;

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  function init() {
    createScene();
    createLights();
    createPlane();
    createSea();
    createSky();
    loop();
    setLoaded(true);
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  /**
   * Updates the viewport dimensions when the window is resized.
   * This effect runs once on mount and sets up a resize event listener.
   * It updates the dimensions state with the container's current width and height.
   * The event listener is cleaned up on component unmount.
   * @returns {void}
   */
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

    init();

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [viewport]);

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