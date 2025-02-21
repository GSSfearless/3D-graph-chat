import { Node, Edge } from '../types/graph';
import * as THREE from 'three';

export const calculateNodePosition = (node: Node, depth: number, index: number, totalNodesAtDepth: number) => {
  const radius = depth * 10;
  const angle = (index / totalNodesAtDepth) * Math.PI * 2;
  
  return new THREE.Vector3(
    radius * Math.cos(angle),
    radius * Math.sin(angle),
    depth * -5
  );
};

export const generateCurvedPath = (start: { x: number; y: number; z: number }, end: { x: number; y: number; z: number }): THREE.CatmullRomCurve3 => {
  const startVec = new THREE.Vector3(start.x, start.y, start.z);
  const endVec = new THREE.Vector3(end.x, end.y, end.z);
  const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
  const distance = startVec.distanceTo(endVec);
  
  midPoint.z += distance * 0.2;
  
  const points = [
    startVec,
    midPoint,
    endVec
  ];
  
  return new THREE.CatmullRomCurve3(points);
};

export const calculateForces = (nodes: Node[], edges: Edge[]) => {
  const repulsionForce = 1;
  const attractionForce = 0.1;
  const forces = new Map<string, THREE.Vector3>();
  
  // Initialize forces
  nodes.forEach(node => {
    forces.set(node.id, new THREE.Vector3(0, 0, 0));
  });
  
  // Calculate repulsion between all nodes
  nodes.forEach((node1, i) => {
    nodes.slice(i + 1).forEach(node2 => {
      if (!node1.position || !node2.position) return;
      
      const pos1 = new THREE.Vector3(node1.position.x, node1.position.y, node1.position.z);
      const pos2 = new THREE.Vector3(node2.position.x, node2.position.y, node2.position.z);
      const direction = new THREE.Vector3().subVectors(pos1, pos2);
      const distance = direction.length();
      
      if (distance === 0) return;
      
      const force = direction.normalize().multiplyScalar(repulsionForce / (distance * distance));
      
      const force1 = forces.get(node1.id);
      const force2 = forces.get(node2.id);
      if (force1) force1.add(force);
      if (force2) force2.sub(force);
    });
  });
  
  // Calculate attraction along edges
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode?.position || !targetNode?.position) return;
    
    const pos1 = new THREE.Vector3(sourceNode.position.x, sourceNode.position.y, sourceNode.position.z);
    const pos2 = new THREE.Vector3(targetNode.position.x, targetNode.position.y, targetNode.position.z);
    const direction = new THREE.Vector3().subVectors(pos2, pos1);
    const distance = direction.length();
    
    const force = direction.normalize().multiplyScalar(distance * attractionForce);
    
    const sourceForce = forces.get(sourceNode.id);
    const targetForce = forces.get(targetNode.id);
    if (sourceForce) sourceForce.add(force);
    if (targetForce) targetForce.sub(force);
  });
  
  return forces;
};

export const applyForces = (nodes: Node[], forces: Map<string, THREE.Vector3>, damping: number = 0.8) => {
  nodes.forEach(node => {
    if (!node.position) return;
    
    const force = forces.get(node.id);
    if (!force) return;
    
    const nodePos = new THREE.Vector3(node.position.x, node.position.y, node.position.z);
    nodePos.add(force.multiplyScalar(damping));
    
    node.position = {
      x: nodePos.x,
      y: nodePos.y,
      z: nodePos.z
    };
  });
}; 