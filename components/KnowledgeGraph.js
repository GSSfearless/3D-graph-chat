import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress, faSearch, faRefresh, faSave, faDownload } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import gsap from 'gsap';
import _ from 'lodash';

const KnowledgeGraph = ({ data, onNodeClick, style = {} }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [nodeInstances, setNodeInstances] = useState(null);
  
  // 主题配置
  const theme = {
    node: {
      color: '#6366F1',
      highlightColor: '#F43F5E',
      size: 10,
      segments: 32,
      opacity: 0.9,
      glowColor: '#818CF8'
    },
    edge: {
      color: '#94A3B8',
      highlightColor: '#64748B',
      opacity: 0.6,
      width: 2
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
    
    // 添加高级雾效果
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.002);

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
    
    // 启用阴影
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // 创建标签渲染器
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';

    // 添加高级光照系统
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.normalBias = 0.02;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x6366F1, 1, 100);
    pointLight.position.set(-50, 50, 50);
    scene.add(pointLight);

    // 添加环境光遮蔽后处理效果
    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    const aoPass = new THREE.SAOPass(scene, camera, false, true);
    aoPass.params.output = THREE.SAOPass.OUTPUT.Default;
    composer.addPass(aoPass);

    // 添加控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 100;
    controls.maxDistance = 1000;

    // 添加粒子系统
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // 位置
      positions[i3] = (Math.random() - 0.5) * 1000;
      positions[i3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i3 + 2] = (Math.random() - 0.5) * 1000;
      // 速度
      velocities[i3] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
      // 颜色
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.7, 0.7);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        size: { value: 2.0 },
        pixelRatio: { value: window.devicePixelRatio }
      },
      vertexShader: `
        uniform float time;
        uniform float size;
        uniform float pixelRatio;
        attribute vec3 color;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.x += sin(time * 0.5 + position.z * 0.02) * 2.0;
          pos.y += cos(time * 0.5 + position.x * 0.02) * 2.0;
          pos.z += sin(time * 0.5 + position.y * 0.02) * 2.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha * 0.5);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // 更新粒子动画
    const updateParticles = () => {
      const positions = particles.attributes.position.array;
      const time = performance.now() * 0.001;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];

        // 边界检查
        for (let j = 0; j < 3; j++) {
          if (Math.abs(positions[i3 + j]) > 500) {
            positions[i3 + j] *= -1;
          }
        }
      }

      particles.attributes.position.needsUpdate = true;
      particleMaterial.uniforms.time.value = time;
    };

    // 修改动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      updateParticles();
      controls.update();
      composer.render();
    };
    animate();

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
      composer.dispose();
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

  const createNode3D = (nodeData, index, total) => {
    const group = new THREE.Group();

    // 创建高级材质
    const nodeMaterial = new THREE.MeshPhysicalMaterial({
      color: theme.node.color,
      metalness: 0.3,
      roughness: 0.4,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      reflectivity: 1.0,
      transparent: true,
      opacity: theme.node.opacity,
      side: THREE.DoubleSide
    });

    // 创建球体几何体
    const geometry = new THREE.SphereGeometry(
      theme.node.size,
      theme.node.segments,
      theme.node.segments
    );

    const sphere = new THREE.Mesh(geometry, nodeMaterial);
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
      new THREE.SphereGeometry(theme.node.size * 1.2, theme.node.segments, theme.node.segments),
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
    labelDiv.style.background = 'transparent';
    labelDiv.style.padding = '4px 8px';
    labelDiv.style.borderRadius = '4px';
    labelDiv.style.whiteSpace = 'nowrap';
    labelDiv.style.pointerEvents = 'none';
    labelDiv.style.userSelect = 'none';
    
    const label = new CSS2DObject(labelDiv);
    label.position.set(0, theme.node.size + 5, 0);
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
    
    // 创建动画材质
    const edgeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(theme.edge.color) },
        opacity: { value: theme.edge.opacity }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        varying vec2 vUv;
        void main() {
          float dash = sin(vUv.x * 50.0 - time * 2.0) * 0.5 + 0.5;
          gl_FragColor = vec4(color, opacity * dash);
        }
      `,
      transparent: true,
      depthWrite: false
    });

    const line = new THREE.Line(geometry, edgeMaterial);
    
    // 添加动画更新
    const animate = () => {
      edgeMaterial.uniforms.time.value += 0.01;
      requestAnimationFrame(animate);
    };
    animate();

    return line;
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

  // 初始化实例化渲染
  const initInstancedMesh = (nodes) => {
    const geometry = new THREE.SphereGeometry(theme.node.size, theme.node.segments, theme.node.segments);
    const material = new THREE.MeshPhysicalMaterial({
      color: theme.node.color,
      metalness: 0.3,
      roughness: 0.4,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      reflectivity: 1.0,
      transparent: true,
      opacity: theme.node.opacity,
      side: THREE.DoubleSide
    });

    const instances = new THREE.InstancedMesh(geometry, material, nodes.length);
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    nodes.forEach((node, i) => {
      matrix.setPosition(node.position.x, node.position.y, node.position.z);
      instances.setMatrixAt(i, matrix);
      color.set(node.color || theme.node.color);
      instances.setColorAt(i, color);
    });

    instances.instanceMatrix.needsUpdate = true;
    if (instances.instanceColor) instances.instanceColor.needsUpdate = true;

    return instances;
  };

  // 添加悬停效果
  const handleNodeHover = (node, isHovered) => {
    if (!node) return;
    
    const scale = isHovered ? 1.2 : 1.0;
    const duration = 200;
    
    gsap.to(node.scale, {
      x: scale,
      y: scale,
      z: scale,
      duration: duration / 1000,
      ease: 'power2.out'
    });

    setHoveredNode(isHovered ? node : null);
  };

  // 节点展开/折叠
  const toggleNodeExpansion = (node) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(node.id)) {
      newExpandedNodes.delete(node.id);
    } else {
      newExpandedNodes.add(node.id);
    }
    setExpandedNodes(newExpandedNodes);

    // 动画过渡
    const childNodes = data.nodes.filter(n => 
      data.edges.some(e => e.source === node.id && e.target === n.id)
    );

    childNodes.forEach(childNode => {
      const targetScale = newExpandedNodes.has(node.id) ? 1 : 0;
      const targetPosition = calculateChildPosition(node, childNode, newExpandedNodes.has(node.id));
      
      gsap.to(childNode.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 0.5,
        ease: 'power2.inOut'
      });

      gsap.to(childNode.scale, {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration: 0.5,
        ease: 'power2.inOut'
      });
    });
  };

  // LOD实现
  const updateLOD = () => {
    if (!sceneRef.current) return;
    
    const { camera } = sceneRef.current;
    const distanceThreshold = 200;
    
    data.nodes.forEach(node => {
      const distance = camera.position.distanceTo(node.position);
      const level = distance < distanceThreshold ? 'high' : 'low';
      
      if (node.currentLOD !== level) {
        node.currentLOD = level;
        
        if (level === 'high') {
          node.geometry = new THREE.SphereGeometry(
            theme.node.size,
            theme.node.segments,
            theme.node.segments
          );
        } else {
          node.geometry = new THREE.SphereGeometry(
            theme.node.size,
            Math.floor(theme.node.segments / 2),
            Math.floor(theme.node.segments / 2)
          );
        }
      }
    });
  };

  // 视锥体剔除
  const updateFrustumCulling = () => {
    if (!sceneRef.current) return;
    
    const { camera } = sceneRef.current;
    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(matrix);

    data.nodes.forEach(node => {
      const nodePosition = new THREE.Vector3(
        node.position.x,
        node.position.y,
        node.position.z
      );
      node.visible = frustum.containsPoint(nodePosition);
    });
  };

  useEffect(() => {
    initScene();

    // 添加射线投射器用于交互
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, sceneRef.current.camera);
      const intersects = raycaster.intersectObjects(sceneRef.current.scene.children, true);

      if (intersects.length > 0) {
        const node = intersects[0].object;
        if (node !== hoveredNode) {
          handleNodeHover(hoveredNode, false);
          handleNodeHover(node, true);
        }
      } else {
        handleNodeHover(hoveredNode, false);
      }
    };

    containerRef.current.addEventListener('mousemove', onMouseMove);

    // 性能优化：节流更新
    const throttledUpdate = _.throttle(() => {
      updateLOD();
      updateFrustumCulling();
    }, 100);

    sceneRef.current.controls.addEventListener('change', throttledUpdate);

    return () => {
      containerRef.current.removeEventListener('mousemove', onMouseMove);
      sceneRef.current.controls.removeEventListener('change', throttledUpdate);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !data) return;

    const { scene } = sceneRef.current;

    // 清除现有内容
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // 创建节点
    const nodes3D = new Map();
    data.nodes.forEach((node, index) => {
      const node3D = createNode3D(node.data, index, data.nodes.length);
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