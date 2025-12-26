import * as THREE from 'three';

export const createScene = (viewport, container) => {
  // Create the scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

  // Create the camera using viewport config
  const aspectRatio = viewport.width / viewport.height;
  const camera = new THREE.PerspectiveCamera(
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
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setSize(viewport.width, viewport.height);
  renderer.shadowMap.enabled = true;

  container.appendChild(renderer.domElement);

  return { scene, camera, renderer };
};

export const createLights = (scene) => {
  const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

  const shadowLight = new THREE.DirectionalLight(0xffffff, .9);
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

  return { hemisphereLight, shadowLight };
};