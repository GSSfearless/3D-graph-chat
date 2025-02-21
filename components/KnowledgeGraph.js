import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress, faSearch, faRefresh, faSave, faDownload } from '@fortawesome/free-solid-svg-icons';

const KnowledgeGraph = ({ data, onNodeClick, style = {} }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // 主题配置
  const theme = {
    node: {
      color: '#6366F1',
      centerNodeColor: '#F43F5E',
      highlightColor: '#F43F5E',
      size: 10,
      centerNodeSize: 15,
      segments: 32,
      opacity: 0.9,
      glowColor: '#818CF8'
    },
    edge: {
      color: '#94A3B8',
      highlightColor: '#64748B',
      opacity: 0.6,
      width: 2,
      labelColor: '#64748B',
      labelSize: '12px'
    },
    label: {
      color: '#1E293B',
      size: '14px',
      font: 'Inter, system-ui, -apple-system, sans-serif',
      weight: '500'
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

  const createNode3D = (nodeData, index, total, isCenter = false) => {
    const group = new THREE.Group();
    
    // 根据节点类型设置大小和颜色
    const size = isCenter ? theme.node.centerNodeSize : theme.node.size;
    const color = isCenter ? theme.node.centerNodeColor : theme.node.color;
    
    // 创建球体几何体
    const geometry = new THREE.SphereGeometry(size, theme.node.segments, theme.node.segments);
    
    // 创建发光材质
    const material = new THREE.MeshPhongMaterial({
      color: color,
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
      new THREE.SphereGeometry(size * 1.2, theme.node.segments, theme.node.segments),
      glowMaterial
    );
    group.add(glowSphere);

    // 创建标签
    const labelDiv = document.createElement('div');
    labelDiv.className = 'node-label';
    const cleanText = nodeData.label.replace(/[#*]/g, '').replace(/\s+/g, ' ').trim();
    labelDiv.textContent = cleanText;
    labelDiv.style.color = theme.label.color;
    labelDiv.style.fontSize = isCenter ? '16px' : theme.label.size;
    labelDiv.style.fontWeight = isCenter ? '600' : theme.label.weight;
    labelDiv.style.fontFamily = theme.label.font;
    labelDiv.style.background = isCenter ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)';
    labelDiv.style.padding = isCenter ? '6px 12px' : '4px 8px';
    labelDiv.style.borderRadius = '4px';
    labelDiv.style.whiteSpace = 'nowrap';
    labelDiv.style.pointerEvents = 'none';
    labelDiv.style.userSelect = 'none';
    
    const label = new CSS2DObject(labelDiv);
    label.position.set(0, size + 5, 0);
    group.add(label);

    // 计算节点位置
    if (isCenter) {
      group.position.set(0, 0, 0);
    } else {
      const radius = 250;
      const angleStep = (2 * Math.PI) / (total - 1);
      const angle = index * angleStep;
      
      group.position.x = radius * Math.cos(angle);
      group.position.y = radius * Math.sin(angle) * 0.5; // 压缩Y轴使布局更扁平
      group.position.z = radius * Math.sin(angle) * 0.3; // 添加一些深度变化
    }

    group.userData = nodeData;
    return group;
  };

  const createEdge3D = (source, target, label) => {
    const group = new THREE.Group();
    
    // 创建曲线控制点
    const start = source.position.clone();
    const end = target.position.clone();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    
    // 添加一些弧度
    mid.y += Math.abs(end.x - start.x) * 0.2;
    
    // 创建二次贝塞尔曲线
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(50);
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: theme.edge.color,
      transparent: true,
      opacity: theme.edge.opacity,
      linewidth: theme.edge.width
    });
    
    const line = new THREE.Line(geometry, material);
    group.add(line);
    
    // 添加边标签
    if (label) {
      const labelDiv = document.createElement('div');
      labelDiv.className = 'edge-label';
      labelDiv.textContent = label;
      labelDiv.style.color = theme.edge.labelColor;
      labelDiv.style.fontSize = theme.edge.labelSize;
      labelDiv.style.fontFamily = theme.label.font;
      labelDiv.style.fontWeight = theme.label.weight;
      labelDiv.style.padding = '2px 4px';
      labelDiv.style.background = 'rgba(255, 255, 255, 0.9)';
      labelDiv.style.borderRadius = '4px';
      labelDiv.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
      
      const labelObject = new CSS2DObject(labelDiv);
      labelObject.position.copy(mid);
      group.add(labelObject);
    }
    
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

  const handleResetView = () => {
    if (!sceneRef.current) return;
    
    const { camera, controls } = sceneRef.current;
    
    // 重置相机位置
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);
    
    // 重置控制器
    controls.reset();
    controls.target.set(0, 0, 0);
    controls.update();
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

    // 创建节点
    const nodes3D = new Map();
    
    // 首先创建中心节点
    if (data.centerNode) {
      const centerNode3D = createNode3D(data.centerNode, 0, data.nodes.length, true);
      scene.add(centerNode3D);
      nodes3D.set(data.centerNode.id, centerNode3D);
    }
    
    // 创建其他节点
    data.nodes.forEach((node, index) => {
      if (node.data.id !== data.centerNode?.id) {
        const node3D = createNode3D(node.data, index, data.nodes.length);
        scene.add(node3D);
        nodes3D.set(node.data.id, node3D);
      }
    });

    // 添加点击事件
    nodes3D.forEach((node3D) => {
      node3D.children[0].callback = () => handleNodeClick(node3D.children[0]);
    });

    // 创建边
    data.edges.forEach(edge => {
      const source = nodes3D.get(edge.data.source);
      const target = nodes3D.get(edge.data.target);
      if (source && target) {
        const edge3D = createEdge3D(source, target, edge.data.label);
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
          <button onClick={handleResetView} className="toolbar-button" title="重置视角">
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
      </div>
      
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} onWheel={e => e.stopPropagation()} />
      
      <style jsx>{`
        .knowledge-graph-container {
          position: relative;
          background: var(--neutral-50);
          border-radius: 12px;
          overflow: hidden;
          isolation: isolate;
        }
        
        .toolbar {
          position: absolute;
          top: 16px;
          right: 16px;
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