import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import * as THREE from 'three';
import { Node, Edge, KnowledgeGraph, GraphTheme } from '../types/graph';
import { defaultTheme } from '../config/theme';
import { calculateForces, applyForces, generateCurvedPath } from '../utils/graphLayout';
import { AnimationController } from '../utils/animationController';

interface NodeMeshProps {
  node: Node;
  theme: GraphTheme;
  onNodeClick: (node: Node) => void;
  onNodeDoubleClick: (node: Node) => void;
  isHighlighted?: boolean;
  isExpanded?: boolean;
}

const NodeMesh: React.FC<NodeMeshProps> = ({
  node,
  theme,
  onNodeClick,
  onNodeDoubleClick,
  isHighlighted,
  isExpanded
}) => {
  const nodeStyle = theme.nodes[node.type];
  const [hovered, setHovered] = React.useState(false);
  
  const { scale } = useSpring({
    scale: hovered ? 1.2 : isExpanded ? 1.1 : 1,
    config: { tension: 300, friction: 10 }
  });

  const { emissiveIntensity } = useSpring({
    emissiveIntensity: hovered || isHighlighted ? 1 : isExpanded ? 0.8 : 0.5,
    config: { tension: 300, friction: 10 }
  });

  const { x, y, z } = useSpring({
    x: node.position?.x || 0,
    y: node.position?.y || 0,
    z: node.position?.z || 0,
    config: { tension: 170, friction: 26 }
  });
  
  return (
    <animated.group
      position-x={x}
      position-y={y}
      position-z={z}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onNodeClick(node)}
      onDoubleClick={() => onNodeDoubleClick(node)}
    >
      <mesh>
        <sphereGeometry args={[nodeStyle.size, 32, 32]} />
        <animated.meshPhongMaterial
          color={nodeStyle.color}
          emissive={nodeStyle.emissive}
          emissiveIntensity={emissiveIntensity}
          opacity={isHighlighted ? 1 : nodeStyle.opacity}
          transparent={true}
        />
      </mesh>
      <Text
        position={[0, nodeStyle.size + 0.5, 0]}
        fontSize={0.8}
        color={nodeStyle.color}
        anchorX="center"
        anchorY="bottom"
      >
        {node.content}
      </Text>
    </animated.group>
  );
};

interface EdgeLineProps {
  edge: Edge;
  nodes: Node[];
  theme: GraphTheme;
  isHighlighted?: boolean;
}

const EdgeLine: React.FC<EdgeLineProps> = ({
  edge,
  nodes,
  theme,
  isHighlighted
}) => {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);
  
  if (!sourceNode?.position || !targetNode?.position) return null;
  
  const curve = generateCurvedPath(sourceNode.position, targetNode.position);
  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  const edgeStyle = theme.edges[edge.relationship.type];

  const { opacity } = useSpring({
    opacity: isHighlighted ? edgeStyle.opacity : edgeStyle.opacity * 0.5,
    config: { tension: 300, friction: 10 }
  });
  
  return (
    <primitive object={new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: edgeStyle.color,
        opacity: opacity.get(),
        transparent: true,
        linewidth: edgeStyle.width
      })
    )} />
  );
};

interface KnowledgeGraph3DProps {
  graph: KnowledgeGraph;
  theme?: GraphTheme;
  onNodeClick?: (node: Node) => void;
  onNodeDoubleClick?: (node: Node) => void;
  onReady?: (controls: { zoomIn: () => void; zoomOut: () => void; resetView: () => void }) => void;
  expandedNodes?: Set<string>;
}

export const KnowledgeGraph3D: React.FC<KnowledgeGraph3DProps> = ({
  graph,
  theme = defaultTheme,
  onNodeClick = () => {},
  onNodeDoubleClick = () => {},
  onReady,
  expandedNodes = new Set()
}) => {
  const [selectedNode, setSelectedNode] = React.useState<Node | null>(null);
  const [highlightedNodes, setHighlightedNodes] = React.useState<Set<string>>(new Set());
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const animationControllerRef = useRef<AnimationController | null>(null);
  
  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    const connectedNodes = new Set<string>([node.id]);
    
    graph.edges.forEach(edge => {
      if (edge.source === node.id) connectedNodes.add(edge.target);
      if (edge.target === node.id) connectedNodes.add(edge.source);
    });
    
    setHighlightedNodes(connectedNodes);
    onNodeClick(node);

    animationControllerRef.current?.focusOnNode(node);
  };

  const handleNodeDoubleClick = (node: Node) => {
    onNodeDoubleClick(node);
  };

  useEffect(() => {
    if (controlsRef.current && cameraRef.current) {
      animationControllerRef.current = new AnimationController(
        cameraRef.current,
        controlsRef.current
      );

      if (onReady) {
        onReady({
          zoomIn: () => {
            const camera = cameraRef.current!;
            camera.position.multiplyScalar(0.8);
            controlsRef.current.update();
          },
          zoomOut: () => {
            const camera = cameraRef.current!;
            camera.position.multiplyScalar(1.2);
            controlsRef.current.update();
          },
          resetView: () => {
            animationControllerRef.current?.resetView();
          }
        });
      }
    }

    return () => {
      animationControllerRef.current?.dispose();
    };
  }, [onReady]);
  
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 50], fov: 75 }}
        style={{ background: '#111827' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <GraphScene
          graph={graph}
          theme={theme}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          highlightedNodes={highlightedNodes}
          expandedNodes={expandedNodes}
        />
        
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={200}
        />

        <primitive object={new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)} ref={cameraRef} />
      </Canvas>
    </div>
  );
};

interface GraphSceneProps {
  graph: KnowledgeGraph;
  theme: GraphTheme;
  onNodeClick: (node: Node) => void;
  onNodeDoubleClick: (node: Node) => void;
  highlightedNodes: Set<string>;
  expandedNodes: Set<string>;
}

const GraphScene: React.FC<GraphSceneProps> = ({
  graph,
  theme,
  onNodeClick,
  onNodeDoubleClick,
  highlightedNodes,
  expandedNodes
}) => {
  const { nodes, edges } = graph;
  
  useFrame(() => {
    const forces = calculateForces(nodes, edges);
    applyForces(nodes, forces, 0.6);
  });
  
  return (
    <group>
      {edges.map(edge => (
        <EdgeLine
          key={edge.id}
          edge={edge}
          nodes={nodes}
          theme={theme}
          isHighlighted={
            highlightedNodes.has(edge.source) &&
            highlightedNodes.has(edge.target)
          }
        />
      ))}
      
      {nodes.map(node => (
        <NodeMesh
          key={node.id}
          node={node}
          theme={theme}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          isHighlighted={highlightedNodes.has(node.id)}
          isExpanded={expandedNodes.has(node.id)}
        />
      ))}
    </group>
  );
}; 