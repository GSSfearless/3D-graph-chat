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
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  
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

  // 控制器配置
  const initControls = (camera, renderer) => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 100;
    controls.maxDistance = 1000;
    controls.zoomSpeed = 1.5;
    return controls;
  };

  // 节点大小计算
  const calculateNodeSize = (nodeData) => {
    const baseSize = theme.node.size;
    const importance = nodeData.importance || 1;
    const isExpanded = expandedNodes.has(nodeData.id);
    return baseSize * Math.sqrt(importance) * (isExpanded ? 1.5 : 1);
  };

  // 节点颜色计算
  const calculateNodeColor = (nodeData) => {
    const baseColor = new THREE.Color(theme.node.color);
    const type = nodeData.type || 'default';
    const colorMap = {
      concept: '#4A90E2',
      entity: '#50E3C2',
      event: '#F5A623',
      attribute: '#B8E986',
      relation: '#BD10E0',
      default: theme.node.color
    };
    return new THREE.Color(colorMap[type] || colorMap.default);
  };

  // 搜索节点
  const searchNodes = (term) => {
    if (!term) return;
    const searchResults = data.nodes.filter(node => 
      node.data.label.toLowerCase().includes(term.toLowerCase())
    );
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      focusOnNode(firstResult.data.id);
    }
  };

  // 聚焦节点
  const focusOnNode = (nodeId) => {
    const node3D = sceneRef.current.scene.getObjectByName(`node-${nodeId}`);
    if (node3D) {
      const { controls, camera } = sceneRef.current;
      const position = node3D.position.clone();
      const distance = camera.position.distanceTo(position);
      controls.target.copy(position);
      camera.position.copy(position.clone().add(new THREE.Vector3(0, 0, distance)));
      controls.update();
    }
  };

  // 处理节点点击
  const handleNodeClick = (node) => {
    const nodeId = node.userData.id;
    setSelectedNode(nodeId);
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
    if (onNodeClick) {
      onNodeClick(node.userData);
    }
  };

  // 检查数据是否有效
  const isValidData = data && 
    Array.isArray(data.nodes) && 
    Array.isArray(data.edges) && 
    data.nodes.length > 0 &&
    data.nodes.every(node => 
      node && 
      node.data && 
      typeof node.data.id === 'string' && 
      typeof node.data.label === 'string'
    );

  const initScene = () => {
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      1,
      10000
    );
    camera.position.z = 500;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 创建标签渲染器
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);

    // 添加控制器
    const controls = initControls(camera, renderer);

    // 保存引用
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
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      labelRenderer.setSize(width, height);
    };

    const handleMouseMove = (event) => {
      event.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      
      // 重置所有节点的发光效果
      scene.traverse((object) => {
        if (object.material && object.material.uniforms && !object.userData?.isSelected) {
          object.material.uniforms.isSelected.value = 0.0;
        }
      });

      // 设置悬停节点的发光效果
      for (const intersect of intersects) {
        if (intersect.object.userData?.isNode) {
          intersect.object.material.uniforms.isSelected.value = 0.5;
          break;
        }
      }
    };

    const handleClick = (event) => {
      event.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      
      for (const intersect of intersects) {
        if (intersect.object.callback) {
          intersect.object.callback();
          break;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('click', handleClick);
        container.removeChild(renderer.domElement);
        container.removeChild(labelRenderer.domElement);
      }
      
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
  };

  const createNode3D = (nodeData, index, total) => {
    const group = new THREE.Group();
    group.name = `node-${nodeData.id}`;

    // 计算节点大小
    const size = calculateNodeSize(nodeData);
    
    // 创建节点球体
    const geometry = new THREE.SphereGeometry(size, theme.node.segments, theme.node.segments);
    
    // 创建自定义着色器材质
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: calculateNodeColor(nodeData) },
        glowColor: { value: new THREE.Color(theme.node.glowColor) },
        viewVector: { value: new THREE.Vector3() },
        isSelected: { value: selectedNode === nodeData.id ? 1.0 : 0.0 }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vViewPosition = viewVector - worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 glowColor;
        uniform float isSelected;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          float intensity = pow(0.7 - dot(vNormal, normalize(vViewPosition)), 4.0);
          vec3 finalColor = mix(color, glowColor, intensity + isSelected * 0.3);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: true
    });

    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    // 创建标签
    const labelDiv = document.createElement('div');
    labelDiv.className = 'node-label';
    const cleanText = nodeData.label.replace(/[#*]/g, '').replace(/\s+/g, ' ').trim();
    labelDiv.textContent = cleanText;
    labelDiv.style.color = theme.label.color;
    labelDiv.style.fontSize = theme.label.size;
    labelDiv.style.fontFamily = theme.label.font;
    labelDiv.style.fontWeight = theme.label.weight;
    labelDiv.style.background = 'rgba(255, 255, 255, 0.9)';
    labelDiv.style.padding = '4px 8px';
    labelDiv.style.borderRadius = '4px';
    labelDiv.style.whiteSpace = 'nowrap';
    labelDiv.style.pointerEvents = 'none';
    labelDiv.style.userSelect = 'none';
    labelDiv.style.transform = 'translate(-50%, -50%)';
    labelDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    
    const label = new CSS2DObject(labelDiv);
    label.position.set(0, size + 5, 0);
    group.add(label);

    // 添加交互事件
    sphere.userData = { ...nodeData, isNode: true };
    sphere.callback = () => handleNodeClick(sphere);

    // 计算初始位置
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    const radius = 200;

    group.position.x = radius * Math.cos(theta) * Math.sin(phi);
    group.position.y = radius * Math.sin(theta) * Math.sin(phi);
    group.position.z = radius * Math.cos(phi);

    return group;
  };

  const createEdge3D = (source, target, edgeData) => {
    const group = new THREE.Group();

    // 创建边的线条
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
    group.add(line);

    // 添加边标签
    if (edgeData.label) {
      const labelDiv = document.createElement('div');
      labelDiv.className = 'edge-label';
      labelDiv.textContent = edgeData.label;
      labelDiv.style.color = theme.label.color;
      labelDiv.style.fontSize = '12px';
      labelDiv.style.fontFamily = theme.label.font;
      labelDiv.style.background = 'transparent';
      labelDiv.style.padding = '2px 4px';
      labelDiv.style.whiteSpace = 'nowrap';
      labelDiv.style.pointerEvents = 'none';
      labelDiv.style.userSelect = 'none';
      labelDiv.style.textShadow = '0 0 3px rgba(255,255,255,0.8)';
      
      const label = new CSS2DObject(labelDiv);
      
      // 计算边的方向向量
      const direction = new THREE.Vector3()
        .subVectors(target.position, source.position)
        .normalize();
      
      // 计算边的中点
      const midPoint = new THREE.Vector3()
        .addVectors(source.position, target.position)
        .multiplyScalar(0.5);
      
      // 使用边的方向计算更智能的偏移
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(direction, up).normalize();
      
      // 减小偏移距离
      const offsetDistance = 8 + Math.abs(Math.sin(Math.atan2(direction.y, direction.x)) * 4);
      
      // 根据边的ID计算不同的偏移方向
      const edgeId = `${source.userData.id}-${target.userData.id}`;
      const hashCode = [...edgeId].reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
      const offsetSign = hashCode % 2 === 0 ? 1 : -1;
      
      const offset = right.multiplyScalar(offsetDistance * offsetSign);
      
      // 应用偏移
      midPoint.add(offset);
      
      // 设置标签位置
      label.position.copy(midPoint);
      
      // 存储计算数据用于更新
      label.userData = {
        offset,
        direction,
        offsetDistance,
        offsetSign
      };
      
      group.add(label);
    }

    // 添加用户数据
    group.userData = {
      ...edgeData,
      isEdge: true,
      source: source,
      target: target
    };

    // 更新边的位置和标签的方法
    group.updatePosition = () => {
      // 更新线条几何体
      const positions = new Float32Array([
        source.position.x, source.position.y, source.position.z,
        target.position.x, target.position.y, target.position.z
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.computeBoundingSphere();
      
      // 更新标签位置
      if (group.children[1]) {
        const label = group.children[1];
        
        // 重新计算边的中点
        const midPoint = new THREE.Vector3()
          .addVectors(source.position, target.position)
          .multiplyScalar(0.5);
        
        // 重新计算方向向量
        const direction = new THREE.Vector3()
          .subVectors(target.position, source.position)
          .normalize();
        
        // 使用存储的偏移
        const offset = label.userData.offset;
        
        // 应用偏移
        midPoint.add(offset);
        
        // 更新标签位置
        label.position.copy(midPoint);
      }
    };

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

    // 如果数据无效，显示空场景
    if (!isValidData) {
      console.warn('Invalid graph data:', data);
      // 添加基本光源
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      return;
    }

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);

    try {
      // 创建节点
      const nodes3D = new Map();
      data.nodes.forEach((node, index) => {
        const nodeData = node.data;
        if (!nodeData || !nodeData.id || !nodeData.label) {
          console.warn('Invalid node data:', node);
          return;
        }
        const node3D = createNode3D(nodeData, index, data.nodes.length);
        scene.add(node3D);
        nodes3D.set(nodeData.id, node3D);

        // 添加点击事件
        if (node3D.children[0]) {
          node3D.children[0].callback = () => handleNodeClick(node3D.children[0]);
        }
      });

      // 创建边的映射以避免重复
      const edgeMap = new Map();
      
      // 处理边数据
      data.edges.forEach(edge => {
        const edgeData = edge.data || edge;
        
        // 获取源节点和目标节点的ID
        const sourceId = typeof edgeData.source === 'object' ? edgeData.source.id : edgeData.source;
        const targetId = typeof edgeData.target === 'object' ? edgeData.target.id : edgeData.target;
        
        // 创建唯一的边标识符
        const edgeKey = `${sourceId}-${targetId}`;
        
        if (!edgeMap.has(edgeKey)) {
          const source = nodes3D.get(sourceId);
          const target = nodes3D.get(targetId);
          
          if (source && target) {
            const edge3D = createEdge3D(source, target, {
              ...edgeData,
              label: edgeData.label || edgeData.type || '关系'
            });
            edge3D.userData.isEdge = true;
            scene.add(edge3D);
            edgeMap.set(edgeKey, edge3D);
          }
        }
      });

    } catch (error) {
      console.error('Error creating 3D objects:', error);
    }

    // 动画循环
    const animate = () => {
      if (!sceneRef.current) return;
      
      const { scene, camera, renderer, labelRenderer, controls } = sceneRef.current;
      
      // 更新控制器
      controls.update();

      // 更新所有边的位置和标签
      scene.children.forEach(child => {
        if (child.userData?.isEdge && child.updatePosition) {
          child.updatePosition();
        }
      });

      // 更新节点发光效果
      scene.traverse((object) => {
        if (object.material && object.material.uniforms) {
          object.material.uniforms.viewVector.value = camera.position;
        }
      });

      // 渲染场景
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);

      // 继续动画循环
      requestAnimationFrame(animate);
    };
    animate();
  }, [data]);

  useEffect(() => {
    if (isValidData && sceneRef.current) {
      // 不再需要renderEdges，因为边的创建已经在主useEffect中处理
    }
  }, [data, isValidData]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 添加触摸事件支持
  useEffect(() => {
    if (!containerRef.current) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isDragging = true;
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;
      
      // 在这里处理图谱的平移
      // 可以根据需要调整移动速度
      containerRef.current.scrollLeft -= deltaX;
      containerRef.current.scrollTop -= deltaY;
      
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const element = containerRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', ...style }}>
      <div className="graph-controls" style={{
        position: 'absolute',
        top: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000
      }}>
        <div className="search-box" style={{
          display: 'flex',
          alignItems: 'center',
          background: 'white',
          padding: '8px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchNodes(searchTerm)}
            placeholder="搜索节点..."
            style={{
              border: 'none',
              outline: 'none',
              marginRight: '8px',
              width: '150px'
            }}
          />
          <button onClick={() => searchNodes(searchTerm)} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          style={{
            background: 'white',
            border: 'none',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
        </button>
      </div>
      {!isValidData && (
        <div className="empty-state">
          <p>暂无可视化数据</p>
        </div>
      )}
      <div className="toolbar" style={{ 
        flexDirection: isMobile ? 'column' : 'row',
        right: isMobile ? '8px' : '16px',
        top: isMobile ? '8px' : '16px'
      }}>
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
          touch-action: none; /* 防止移动端浏览器默认行为 */
          -webkit-overflow-scrolling: touch; /* iOS平滑滚动 */
        }
        
        .toolbar {
          position: absolute;
          display: flex;
          gap: 8px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        @media (max-width: 768px) {
          .toolbar-button {
            width: 28px;
            height: 28px;
          }

          :global(.node-label) {
            font-size: 10px;
            padding: 1px 2px;
          }

          :global(.edge-label) {
            font-size: 10px;
          }
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

        .empty-state {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #666;
          z-index: 1;
        }

        :global(.edge-label) {
          color: #1a1a1a;
          font-size: 12px;
          padding: 2px 4px;
          background: transparent;
          pointer-events: none;
          white-space: nowrap;
          text-align: center;
          text-shadow: 0 0 3px rgba(255,255,255,0.8);
        }
      `}</style>
    </div>
  );
};

export default KnowledgeGraph;