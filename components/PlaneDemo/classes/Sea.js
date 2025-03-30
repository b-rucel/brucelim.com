import * as THREE from 'three';
import { Colors } from '../constants/colors';

export class Sea {
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