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

export const generateCurvedPath = (start: THREE.Vector3, end: THREE.Vector3): THREE.CatmullRomCurve3 => {
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const distance = start.distanceTo(end);
  
  midPoint.z += distance * 0.2;
  
  const points = [
    start,
    midPoint,
    end
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
      
      const direction = new THREE.Vector3()
        .subVectors(node1.position, node2.position);
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
    
    const direction = new THREE.Vector3()
      .subVectors(targetNode.position, sourceNode.position);
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
    
    node.position.add(force.multiplyScalar(damping));
  });
}; 