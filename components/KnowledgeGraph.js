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
  
  // 主题配置
  const theme = {
    node: {
      color: '#6366F1',
      highlightColor: '#F43F5E',
      minSize: 3,        // 最小节点大小
      maxSize: 15,       // 最大节点大小
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
    console.log('计算节点大小 - 节点数据:', nodeData);
    
    // 计算节点的连接数
    const connections = data.edges.filter(edge => {
      console.log('检查边:', edge);
      console.log('当前节点ID:', nodeData.id);
      console.log('边的source:', edge.data.source);
      console.log('边的target:', edge.data.target);
      
      const isConnected = edge.data.source === nodeData.id || edge.data.target === nodeData.id;
      console.log('是否连接:', isConnected);
      return isConnected;
    }).length;

    console.log('节点连接数:', connections);

    if (connections === 0) {
      console.log('节点无连接，使用最小尺寸:', theme.node.minSize);
      return theme.node.minSize;
    }

    // 找出最大连接数
    const allConnectionCounts = data.nodes.map(node => {
      const count = data.edges.filter(edge => 
        edge.data.source === node.data.id || edge.data.target === node.data.id
      ).length;
      console.log('节点', node.data.id, '的连接数:', count);
      return count;
    });
    
    const maxConnections = Math.max(...allConnectionCounts);
    console.log('最大连接数:', maxConnections);

    // 使用指数函数计算大小
    const base = 1.5; // 指数基数
    const normalizedConnections = connections / maxConnections;
    const size = theme.node.minSize + 
      (theme.node.maxSize - theme.node.minSize) * 
      (Math.pow(base, normalizedConnections) - 1) / (base - 1);

    console.log('最终计算的节点大小:', size);
    return size;
  };

  const createNode3D = (nodeData, index, total) => {
    const group = new THREE.Group();

    // 计算节点大小
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
    
    // 添加悬浮效果所需的属性
    sphere.userData = {
      ...nodeData,
      originalScale: new THREE.Vector3(1, 1, 1),
      originalColor: theme.node.color,
      hoverScale: new THREE.Vector3(1.3, 1.3, 1.3),
      isHovered: false
    };
    
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
    labelDiv.style.background = 'transparent';
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

  useEffect(() => {
    if (!sceneRef.current || !data) return;

    const { scene, camera, renderer } = sceneRef.current;

    // 添加鼠标事件处理
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredNode = null;

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // 找到第一个是球体的相交对象
      const nodeIntersect = intersects.find(intersect => 
        intersect.object.type === 'Mesh' && 
        intersect.object.geometry.type === 'SphereGeometry'
      );

      // 如果之前有悬浮的节点，恢复其状态
      if (hoveredNode && (!nodeIntersect || nodeIntersect.object !== hoveredNode)) {
        const material = hoveredNode.material;
        material.color.set(hoveredNode.userData.originalColor);
        hoveredNode.scale.copy(hoveredNode.userData.originalScale);
        hoveredNode.userData.isHovered = false;
        
        // 更新发光效果
        const glowSphere = hoveredNode.parent.children[1];
        glowSphere.material.uniforms.c.value = 0.5;
        glowSphere.material.uniforms.p.value = 1.4;
        hoveredNode = null;
      }

      // 如果找到新的节点，应用悬浮效果
      if (nodeIntersect && nodeIntersect.object !== hoveredNode) {
        const node = nodeIntersect.object;
        const material = node.material;
        material.color.set(theme.node.highlightColor);
        node.scale.copy(node.userData.hoverScale);
        node.userData.isHovered = true;
        
        // 增强发光效果
        const glowSphere = node.parent.children[1];
        glowSphere.material.uniforms.c.value = 0.8;
        glowSphere.material.uniforms.p.value = 2.0;
        hoveredNode = node;
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);

    return () => {
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
    };
  }, [data]);

  return (
    <div className="knowledge-graph-container" style={{ width: '100%', height: '100%', ...style }}>
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