import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress, faSearch, faRefresh, faSave, faDownload } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';

const KnowledgeGraph = ({ data, onNodeClick, style = {} }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // 主题配置
  const theme = {
    node: {
      color: '#6366F1',
      highlightColor: '#F43F5E',
      size: {
        min: 8,
        max: 20,
        default: 12
      },
      segments: 32,
      opacity: 0.85,
      glowColor: '#818CF8'
    },
    edge: {
      color: '#94A3B8',
      highlightColor: '#64748B',
      opacity: 0.4,
      width: 1.5
    },
    label: {
      color: '#1E293B',
      size: '13px',
      font: 'Inter, system-ui, -apple-system, sans-serif',
      weight: '500',
      background: 'rgba(255, 255, 255, 0.7)'
    }
  };

  const initScene = () => {
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = new THREE.Fog(0xf8fafc, 100, 1000);

    // 创建相机
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
    camera.position.z = 500;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 创建标签渲染器
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(100, 100, 100);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // 添加控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 100;
    controls.maxDistance = 1000;

    // 清除原有内容并添加新的渲染器
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.appendChild(labelRenderer.domElement);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      labelRenderer,
      controls,
      width,
      height
    };

    // 添加事件监听
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  };

  const handleResize = () => {
    if (!sceneRef.current) return;

    const { camera, renderer, labelRenderer, width, height } = sceneRef.current;
    const container = containerRef.current;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
    labelRenderer.setSize(newWidth, newHeight);
  };

  const calculateNodeSize = (nodeData) => {
    const connections = data.edges.filter(edge => 
      edge.data.source === nodeData.id || edge.data.target === nodeData.id
    ).length;
    
    const size = Math.max(
      theme.node.size.min,
      Math.min(theme.node.size.max, 
        theme.node.size.default + (connections * 0.5)
      )
    );
    
    return size;
  };

  const createNode3D = (nodeData, index, total) => {
    const group = new THREE.Group();
    const nodeSize = calculateNodeSize(nodeData);

    // 创建球体几何体
    const geometry = new THREE.SphereGeometry(
      nodeSize,
      theme.node.segments,
      theme.node.segments
    );

    // 创建发光材质
    const material = new THREE.MeshPhongMaterial({
      color: theme.node.color,
      specular: 0x666666,
      shininess: 50,
      transparent: true,
      opacity: theme.node.opacity
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    group.add(sphere);

    // 添加发光效果
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        c: { type: 'f', value: 0.5 },
        p: { type: 'f', value: 1.4 },
        glowColor: { type: 'c', value: new THREE.Color(theme.node.glowColor) },
        viewVector: { type: 'v3', value: sceneRef.current.camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.5 - dot(vNormal, vNormel), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, 1.0);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const glowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(nodeSize * 1.2, theme.node.segments, theme.node.segments),
      glowMaterial
    );
    group.add(glowSphere);

    // 创建标签
    const labelDiv = document.createElement('div');
    labelDiv.className = 'node-label';
    // 清理文本内容，移除特殊字符
    const cleanText = nodeData.label.replace(/[#*]/g, '').replace(/\s+/g, ' ').trim();
    labelDiv.textContent = cleanText;
    labelDiv.style.color = theme.label.color;
    labelDiv.style.fontSize = theme.label.size;
    labelDiv.style.fontFamily = theme.label.font;
    labelDiv.style.background = theme.label.background;
    labelDiv.style.padding = '4px 8px';
    labelDiv.style.borderRadius = '4px';
    labelDiv.style.whiteSpace = 'nowrap';
    labelDiv.style.pointerEvents = 'none';
    labelDiv.style.userSelect = 'none';
    
    const label = new CSS2DObject(labelDiv);
    label.position.set(0, nodeSize + 5, 0);
    group.add(label);

    // 计算节点位置
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    const radius = 200;

    group.position.x = radius * Math.cos(theta) * Math.sin(phi);
    group.position.y = radius * Math.sin(theta) * Math.sin(phi);
    group.position.z = radius * Math.cos(phi);

    // 添加用户数据
    group.userData = nodeData;

    return group;
  };

  const createEdge3D = (source, target) => {
    const points = [];
    points.push(source.position);
    points.push(target.position);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // 创建发光材质
    const material = new THREE.LineBasicMaterial({
      color: theme.edge.color,
      transparent: true,
      opacity: theme.edge.opacity,
      linewidth: theme.edge.width
    });

    const line = new THREE.Line(geometry, material);
    
    // 添加发光效果
    const glowMaterial = new THREE.LineBasicMaterial({
      color: theme.edge.color,
      transparent: true,
      opacity: theme.edge.opacity * 0.5,
      linewidth: theme.edge.width * 2
    });

    const glowLine = new THREE.Line(geometry, glowMaterial);
    
    const group = new THREE.Group();
    group.add(line);
    group.add(glowLine);

    return group;
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

  const handleNodeClick = (node) => {
    if (selectedNode) {
      selectedNode.material.color.setHex(parseInt(theme.node.color.replace('#', '0x')));
    }
    
    node.material.color.setHex(parseInt(theme.node.highlightColor.replace('#', '0x')));
    setSelectedNode(node);
    onNodeClick && onNodeClick(node.userData);
  };

  const handleNodeHover = (node, isHover) => {
    if (!node) return;
    
    const material = node.material;
    const relatedNodes = new Set();
    const relatedEdges = new Set();
    
    // 找到相关节点和边
    data.edges.forEach(edge => {
      if (edge.data.source === node.userData.id) {
        relatedNodes.add(edge.data.target);
        relatedEdges.add(edge);
      }
      if (edge.data.target === node.userData.id) {
        relatedNodes.add(edge.data.source);
        relatedEdges.add(edge);
      }
    });

    // 更新节点样式
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const isRelated = relatedNodes.has(object.userData?.id);
        const isCurrent = object.userData?.id === node.userData.id;
        
        if (object.material.type === 'MeshPhongMaterial') {
          if (isHover) {
            if (isCurrent) {
              object.material.opacity = 1;
              object.material.color.setHex(parseInt(theme.node.highlightColor.replace('#', '0x')));
            } else if (isRelated) {
              object.material.opacity = 0.8;
            } else {
              object.material.opacity = 0.3;
            }
          } else {
            object.material.opacity = theme.node.opacity;
            if (!object.isSelected) {
              object.material.color.setHex(parseInt(theme.node.color.replace('#', '0x')));
            }
          }
        }
      }
      
      // 更新边的样式
      if (object instanceof THREE.Line) {
        const edge = object.userData;
        if (edge) {
          const isRelated = relatedEdges.has(edge);
          if (isHover) {
            object.material.opacity = isRelated ? theme.edge.opacity * 2 : theme.edge.opacity * 0.2;
          } else {
            object.material.opacity = theme.edge.opacity;
          }
        }
      }
    });
  };

  // 添加射线检测器用于鼠标交互
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredNode = null;

  const onMouseMove = (event) => {
    const rect = containerRef.current.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, sceneRef.current.camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    const hitNode = intersects.find(intersect => 
      intersect.object instanceof THREE.Mesh && 
      intersect.object.material.type === 'MeshPhongMaterial'
    )?.object;

    if (hitNode !== hoveredNode) {
      handleNodeHover(hoveredNode, false);
      handleNodeHover(hitNode, true);
      hoveredNode = hitNode;
      
      // 更新鼠标样式
      containerRef.current.style.cursor = hitNode ? 'pointer' : 'default';
    }
  };

  // 添加平滑过渡
  const handleZoom = (delta) => {
    const camera = sceneRef.current.camera;
    const controls = sceneRef.current.controls;
    
    const targetZoom = camera.zoom * (delta > 0 ? 1.2 : 0.8);
    const duration = 500;
    const startZoom = camera.zoom;
    
    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // 缓动函数
      
      camera.zoom = startZoom + (targetZoom - startZoom) * easeProgress;
      camera.updateProjectionMatrix();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    const startTime = performance.now();
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    initScene();
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !data) return;

    const { scene } = sceneRef.current;

    // 清除现有内容
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);

    // 力导向布局参数
    const forceLayout = {
      centerForce: 1,
      repulsionForce: 50,
      linkDistance: 100,
      damping: 0.5,
      iterations: 100
    };

    // 计算节点初始位置
    const nodes3D = new Map();
    const positions = new Map();
    const velocities = new Map();

    data.nodes.forEach((node, index) => {
      // 随机初始位置
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 200 + Math.random() * 100;
      
      const position = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
      
      positions.set(node.data.id, position);
      velocities.set(node.data.id, new THREE.Vector3());
    });

    // 力导向布局迭代
    for (let i = 0; i < forceLayout.iterations; i++) {
      // 计算排斥力
      data.nodes.forEach((node1) => {
        data.nodes.forEach((node2) => {
          if (node1.data.id !== node2.data.id) {
            const pos1 = positions.get(node1.data.id);
            const pos2 = positions.get(node2.data.id);
            const diff = pos1.clone().sub(pos2);
            const distance = diff.length();
            
            if (distance < forceLayout.repulsionForce * 2) {
              const force = diff.normalize().multiplyScalar(
                forceLayout.repulsionForce / (distance * distance)
              );
              velocities.get(node1.data.id).add(force);
              velocities.get(node2.data.id).sub(force);
            }
          }
        });
      });

      // 计算连接力
      data.edges.forEach(edge => {
        const pos1 = positions.get(edge.data.source);
        const pos2 = positions.get(edge.data.target);
        if (pos1 && pos2) {
          const diff = pos2.clone().sub(pos1);
          const distance = diff.length();
          const force = diff.normalize().multiplyScalar(
            (distance - forceLayout.linkDistance) * 0.05
          );
          velocities.get(edge.data.source).add(force);
          velocities.get(edge.data.target).sub(force);
        }
      });

      // 更新位置
      positions.forEach((position, nodeId) => {
        const velocity = velocities.get(nodeId);
        velocity.multiplyScalar(forceLayout.damping);
        position.add(velocity);
        
        // 限制最大距离
        if (position.length() > 500) {
          position.normalize().multiplyScalar(500);
        }
      });
    }

    // 创建节点
    data.nodes.forEach((node) => {
      const node3D = createNode3D(node.data, 0, data.nodes.length);
      const position = positions.get(node.data.id);
      node3D.position.copy(position);
      scene.add(node3D);
      nodes3D.set(node.data.id, node3D);

      // 添加点击事件
      node3D.children[0].callback = () => handleNodeClick(node3D.children[0]);
    });

    // 创建边
    data.edges.forEach(edge => {
      const source = nodes3D.get(edge.data.source);
      const target = nodes3D.get(edge.data.target);
      if (source && target) {
        const edge3D = createEdge3D(source, target);
        scene.add(edge3D);
      }
    });

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      
      const { controls, renderer, labelRenderer, camera } = sceneRef.current;
      
      // 更新控制器
      controls.update();

      // 更新节点发光效果
      scene.traverse((object) => {
        if (object.material && object.material.uniforms) {
          object.material.uniforms.viewVector.value = camera.position;
        }
      });

      // 渲染场景
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();
  }, [data]);

  // 添加事件监听
  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener('mousemove', onMouseMove);
    return () => {
      container.removeEventListener('mousemove', onMouseMove);
    };
  }, [data]);

  return (
    <div className="knowledge-graph-container" style={{ width: '100%', height: '100%', ...style }}>
      <div className="toolbar">
        <div className="toolbar-group">
          <button onClick={() => sceneRef.current.controls.zoomIn()} className="toolbar-button" title="放大">
            <FontAwesomeIcon icon={faSearch} className="mr-1" />+
          </button>
          <button onClick={() => sceneRef.current.controls.zoomOut()} className="toolbar-button" title="缩小">
            <FontAwesomeIcon icon={faSearch} className="mr-1" />-
          </button>
          <button onClick={() => sceneRef.current.controls.reset()} className="toolbar-button" title="重置视角">
            <FontAwesomeIcon icon={faRefresh} />
          </button>
        </div>
        <div className="toolbar-group">
          <button onClick={handleFullscreen} className="toolbar-button" title="全屏">
            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
          </button>
          <button
            onClick={() => {
              const dataUrl = sceneRef.current.renderer.domElement.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = 'knowledge-graph.png';
              link.click();
            }}
            className="toolbar-button"
            title="导出图片"
          >
            <FontAwesomeIcon icon={faDownload} />
          </button>
        </div>
        <div className="toolbar-group">
          <a href="https://discord.gg/your-discord" target="_blank" rel="noopener noreferrer" 
             className="toolbar-button discord-button" title="加入Discord">
            <FontAwesomeIcon icon={faDiscord} />
          </a>
          <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" 
             className="toolbar-button github-button" title="GitHub">
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
      </div>
      
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {selectedNode && (
        <div className="node-details-panel">
          <h3 className="text-lg font-semibold mb-2">{selectedNode.userData.label}</h3>
          <p className="text-sm text-gray-600">{selectedNode.userData.description || '暂无描述'}</p>
        </div>
      )}
      
      <style jsx>{`
        .knowledge-graph-container {
          position: relative;
          background: var(--neutral-50);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .toolbar {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 16px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .toolbar-group {
          display: flex;
          gap: 8px;
          padding: 0 8px;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .toolbar-group:last-child {
          border-right: none;
        }

        .toolbar-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--neutral-600);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toolbar-button:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--neutral-900);
        }

        .discord-button {
          color: #5865F2;
        }

        .discord-button:hover {
          background: rgba(88, 101, 242, 0.1);
          color: #4752C4;
        }

        .github-button {
          color: #24292e;
        }

        .github-button:hover {
          background: rgba(36, 41, 46, 0.1);
        }
        
        .node-details-panel {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          max-width: 300px;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        :global(.node-label) {
          color: #1a1a1a;
          font-size: 12px;
          padding: 2px 4px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 4px;
          pointer-events: none;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default KnowledgeGraph;