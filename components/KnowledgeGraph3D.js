import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, useHelper, Environment, Effects } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress, faCamera, faDownload } from '@fortawesome/free-solid-svg-icons';

// 节点组件
const Node = ({ position, data, onClick, isSelected }) => {
  const meshRef = useRef();
  const textRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={isSelected ? "#F43F5E" : (hovered ? "#818CF8" : "#6366F1")}
          roughness={0.2}
          metalness={0.8}
          transmission={0.5}
          thickness={0.5}
        />
      </mesh>
      <Text
        ref={textRef}
        position={[0, 1.5, 0]}
        fontSize={0.5}
        color={isSelected ? "#F43F5E" : (hovered ? "#818CF8" : "#ffffff")}
        anchorX="center"
        anchorY="middle"
      >
        {data.label}
      </Text>
    </group>
  );
};

// 边组件
const Edge = ({ start, end, color = "#94A3B8" }) => {
  const ref = useRef();
  
  useEffect(() => {
    if (ref.current) {
      const points = [
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      ref.current.geometry.setFromPoints(curve.getPoints(50));
    }
  }, [start, end]);

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.6} />
    </line>
  );
};

// 场景组件
const Scene = ({ data, onNodeClick, selectedNode }) => {
  const { camera } = useThree();
  const groupRef = useRef();

  useEffect(() => {
    if (groupRef.current && data.nodes.length > 0) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraDistance = maxDim / (2 * Math.tan(fov / 2));
      camera.position.z = cameraDistance * 2;
      camera.updateProjectionMatrix();
    }
  }, [data, camera]);

  // 使用力导向算法计算节点位置
  const [nodePositions, setNodePositions] = useState(new Map());
  
  useEffect(() => {
    const positions = new Map();
    data.nodes.forEach((node, i) => {
      const angle = (i / data.nodes.length) * Math.PI * 2;
      const radius = 10;
      positions.set(node.data.id, [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.5,
        Math.sin(angle * 2) * radius * 0.3
      ]);
    });
    setNodePositions(positions);
  }, [data]);

  return (
    <group ref={groupRef}>
      {/* 环境光和点光源 */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* 渲染边 */}
      {data.edges.map((edge, i) => {
        const startPos = nodePositions.get(edge.data.source);
        const endPos = nodePositions.get(edge.data.target);
        if (startPos && endPos) {
          return (
            <Edge
              key={`edge-${i}`}
              start={startPos}
              end={endPos}
              color={edge.data.type === 'primary' ? "#6366F1" : "#94A3B8"}
            />
          );
        }
        return null;
      })}
      
      {/* 渲染节点 */}
      {data.nodes.map((node) => {
        const position = nodePositions.get(node.data.id);
        if (position) {
          return (
            <Node
              key={node.data.id}
              position={position}
              data={node.data}
              onClick={() => onNodeClick(node.data)}
              isSelected={selectedNode?.id === node.data.id}
            />
          );
        }
        return null;
      })}
    </group>
  );
};

// 主组件
const KnowledgeGraph3D = ({ data, onNodeClick, style = {} }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef();

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    const link = document.createElement('a');
    link.download = 'knowledge-graph-3d.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', ...style }}>
      {/* 工具栏 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-4 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full">
        <button
          onClick={handleFullscreen}
          className="p-2 hover:bg-white/20 rounded-full transition-all"
          title={isFullscreen ? "退出全屏" : "全屏显示"}
        >
          <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="text-white" />
        </button>
        <button
          onClick={handleScreenshot}
          className="p-2 hover:bg-white/20 rounded-full transition-all"
          title="截图"
        >
          <FontAwesomeIcon icon={faCamera} className="text-white" />
        </button>
      </div>

      {/* 3D场景 */}
      <Canvas
        camera={{ position: [0, 0, 50], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #0F172A, #1E293B)' }}
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
        <Scene data={data} onNodeClick={handleNodeClick} selectedNode={selectedNode} />
        
        {/* 后期处理效果 */}
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            height={300}
          />
          <DepthOfField
            focusDistance={0}
            focalLength={0.02}
            bokehScale={2}
            height={480}
          />
        </EffectComposer>

        {/* 环境光照 */}
        <Environment preset="sunset" />
      </Canvas>

      {/* 节点详情面板 */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-lg p-4 rounded-lg text-white max-w-md">
          <h3 className="text-xl font-bold mb-2">{selectedNode.label}</h3>
          <p className="text-sm opacity-80">{selectedNode.description || '暂无描述'}</p>
        </div>
      )}

      <style jsx>{`
        button {
          color: white;
          border: none;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default KnowledgeGraph3D; 