import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 预设的知识图谱演示数据
const demoData = {
  nodes: [
    { id: 'knowledge-graph', label: '知识图谱', group: 'concept', size: 15 },
    { id: 'visualization', label: '可视化', group: 'concept', size: 12 },
    { id: '3d-rendering', label: '3D渲染', group: 'technology', size: 12 },
    { id: 'interactive', label: '交互性', group: 'feature', size: 10 },
    { id: 'data-mining', label: '数据挖掘', group: 'technology', size: 12 },
    { id: 'ai', label: '人工智能', group: 'technology', size: 13 },
    { id: 'ml', label: '机器学习', group: 'technology', size: 11 },
    { id: 'nlp', label: '自然语言处理', group: 'technology', size: 12 },
    { id: 'semantic', label: '语义分析', group: 'technology', size: 10 },
    { id: 'entity', label: '实体识别', group: 'feature', size: 9 },
    { id: 'relation', label: '关系抽取', group: 'feature', size: 9 },
    { id: 'spatial', label: '空间思维', group: 'concept', size: 11 },
    { id: 'cognition', label: '认知科学', group: 'concept', size: 11 },
    { id: 'thinking', label: '立体思考', group: 'concept', size: 12 },
    { id: 'learning', label: '学习效率', group: 'benefit', size: 10 },
  ],
  links: [
    { source: 'knowledge-graph', target: 'visualization', value: 5 },
    { source: 'knowledge-graph', target: '3d-rendering', value: 4 },
    { source: 'knowledge-graph', target: 'interactive', value: 3 },
    { source: 'knowledge-graph', target: 'data-mining', value: 4 },
    { source: 'knowledge-graph', target: 'ai', value: 4 },
    { source: 'ai', target: 'ml', value: 5 },
    { source: 'ai', target: 'nlp', value: 5 },
    { source: 'nlp', target: 'semantic', value: 4 },
    { source: 'nlp', target: 'entity', value: 4 },
    { source: 'nlp', target: 'relation', value: 4 },
    { source: 'visualization', target: '3d-rendering', value: 4 },
    { source: 'visualization', target: 'spatial', value: 3 },
    { source: 'spatial', target: 'cognition', value: 3 },
    { source: 'cognition', target: 'thinking', value: 3 },
    { source: 'cognition', target: 'learning', value: 3 },
    { source: 'thinking', target: 'learning', value: 3 },
    { source: 'thinking', target: 'knowledge-graph', value: 4 },
    { source: 'interactive', target: 'learning', value: 2 },
  ]
};

// 颜色映射
const groupColors = {
  concept: '#6366F1', // 蓝紫色
  technology: '#8B5CF6', // 紫色
  feature: '#EC4899', // 粉色 
  benefit: '#F97316', // 橙色
  default: '#6366F1' // 默认颜色
};

const DemoKnowledgeGraph = () => {
  const containerRef = useRef(null);
  const requestRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 场景初始化
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 150;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // 添加控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(200, 200, 200);
    scene.add(directionalLight);
    
    // 创建节点和连线
    const nodeObjects = new Map();
    const nodes = demoData.nodes;
    const links = demoData.links;
    
    // 创建节点
    nodes.forEach(node => {
      const color = groupColors[node.group] || groupColors.default;
      const geometry = new THREE.SphereGeometry(node.size || 5, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.9,
        shininess: 100
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      
      // 随机位置
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 50 + Math.random() * 30;
      
      sphere.position.x = radius * Math.sin(phi) * Math.cos(theta);
      sphere.position.y = radius * Math.sin(phi) * Math.sin(theta);
      sphere.position.z = radius * Math.cos(phi);
      
      sphere.userData = { id: node.id, label: node.label };
      scene.add(sphere);
      nodeObjects.set(node.id, sphere);
    });
    
    // 创建连线
    links.forEach(link => {
      const sourceNode = nodeObjects.get(link.source);
      const targetNode = nodeObjects.get(link.target);
      
      if (sourceNode && targetNode) {
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xaabbcc,
          transparent: true,
          opacity: 0.4,
          linewidth: 1
        });
        
        const points = [sourceNode.position, targetNode.position];
        lineGeometry.setFromPoints(points);
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        
        // 将线与节点关联，以便更新位置
        line.userData = {
          sourceId: link.source,
          targetId: link.target,
          update: () => {
            const start = nodeObjects.get(link.source).position;
            const end = nodeObjects.get(link.target).position;
            const points = [start, end];
            line.geometry.setFromPoints(points);
            line.geometry.attributes.position.needsUpdate = true;
          }
        };
      }
    });

    // 动画循环
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
      
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // 释放资源
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);
  
  return <div ref={containerRef} className="w-full h-full" />;
};

export default DemoKnowledgeGraph; 