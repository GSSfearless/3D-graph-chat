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
      glowColor: '#818CF8',
      levels: {
        1: { color: '#3B82F6', size: 15, glow: 2.0 },
        2: { color: '#6366F1', size: 12, glow: 1.5 },
        3: { color: '#8B5CF6', size: 9, glow: 1.0 }
      }
    },
    edge: {
      color: '#94A3B8',
      highlightColor: '#64748B',
      opacity: 0.6,
      width: 2,
      particles: {
        count: 20,
        size: 0.5,
        speed: 0.02,
        color: '#818CF8'
      }
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
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = new THREE.Fog(0xf8fafc, 100, 1000);

    // 创建相机并设置到合适的观察位置
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    // 将相机位置设置为球体半径的2.5倍，确保能看到整个球体
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);

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

    // 优化控制器设置
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼效果
    controls.dampingFactor = 0.1; // 阻尼系数
    controls.rotateSpeed = 0.8; // 降低旋转速度
    controls.panSpeed = 0.8; // 平移速度
    controls.zoomSpeed = 1.2; // 缩放速度
    controls.minDistance = 300; // 最小距离，防止过于靠近
    controls.maxDistance = 1000; // 最大距离
    controls.target.set(0, 0, 0); // 设置旋转中心为原点（球心）
    controls.enablePan = true; // 允许平移
    controls.enableZoom = true; // 允许缩放
    controls.autoRotate = false; // 禁用自动旋转
    controls.screenSpacePanning = true; // 使平移始终平行于屏幕

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
    if (!sceneRef.current || !containerRef.current) return;

    const { camera, renderer, labelRenderer } = sceneRef.current;
    const container = containerRef.current;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
    labelRenderer.setSize(newWidth, newHeight);
  };

  // 添加一个工具函数来统一处理ID
  const normalizeId = (id) => {
    if (!id) return '';
    const stringId = String(id).trim();
    // 移除已存在的 'node-' 前缀，避免重复添加
    const baseId = stringId.startsWith('node-') ? stringId.slice(5) : stringId;
    // 统一处理特殊字符
    return `node-${baseId.replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  const calculateNodeSize = (nodeData) => {
    // 计算节点的连接数
    const connections = data.edges.filter(edge => {
      const sourceId = normalizeId(edge.data?.source?.id || edge.data?.source);
      const targetId = normalizeId(edge.data?.target?.id || edge.data?.target);
      const nodeId = normalizeId(nodeData.id);
      const isConnected = sourceId === nodeId || targetId === nodeId;
      return isConnected;
    }).length;

    console.log(`节点 [${nodeData.label}] (ID: ${nodeData.id}) 的连接数: ${connections}`);

    if (connections === 0) {
      return theme.node.minSize;
    }

    // 找出最大连接数
    const allConnectionCounts = data.nodes.map(node => {
      const nodeId = normalizeId(node.data.id);
      return data.edges.filter(edge => {
        const sourceId = normalizeId(edge.data?.source?.id || edge.data?.source);
        const targetId = normalizeId(edge.data?.target?.id || edge.data?.target);
        return sourceId === nodeId || targetId === nodeId;
      }).length;
    });
    
    const maxConnections = Math.max(...allConnectionCounts);

    // 使用指数函数计算大小
    const base = 2.0; // 增大基数以使差异更明显
    const normalizedConnections = connections / maxConnections;
    const size = theme.node.minSize + 
      (theme.node.maxSize - theme.node.minSize) * 
      (Math.pow(base, normalizedConnections) - 1) / (base - 1);

    return size;
  };

  const createParticleSystem = (source, target) => {
    const points = [];
    const particleCount = theme.edge.particles.count;
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      color: theme.edge.particles.color,
      size: theme.edge.particles.size,
      transparent: true,
      opacity: 0.6
    });

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const point = new THREE.Vector3(
        source.x + (target.x - source.x) * t,
        source.y + (target.y - source.y) * t,
        source.z + (target.z - source.z) * t
      );
      points.push(point);
    }

    geometry.setFromPoints(points);
    return new THREE.Points(geometry, material);
  };

  const createNode3D = (nodeData, index, total) => {
    const level = nodeData.data.level || 1;
    const levelConfig = theme.node.levels[level];
    
    const geometry = new THREE.SphereGeometry(
      levelConfig.size,
      theme.node.segments,
      theme.node.segments
    );

    const material = new THREE.MeshPhongMaterial({
      color: levelConfig.color,
      transparent: true,
      opacity: theme.node.opacity
    });

    const node = new THREE.Mesh(geometry, material);

    // 添加发光效果
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        c: { type: "f", value: 0.1 },
        p: { type: "f", value: 1.4 },
        glowColor: { type: "c", value: new THREE.Color(theme.node.glowColor) },
        viewVector: { type: "v3", value: sceneRef.current.camera.position }
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
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const glowMesh = new THREE.Mesh(geometry.clone(), glowMaterial);
    glowMesh.scale.multiplyScalar(1.2);
    node.add(glowMesh);

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
    label.position.set(0, levelConfig.size + 5, 0);
    node.add(label);

    // 计算节点位置
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    const radius = 200;

    node.position.x = radius * Math.cos(theta) * Math.sin(phi);
    node.position.y = radius * Math.sin(theta) * Math.sin(phi);
    node.position.z = radius * Math.cos(phi);

    // 添加用户数据
    node.userData = nodeData;

    return node;
  };

  const createEdge3D = (source, target, edgeData) => {
    const group = new THREE.Group();

    // 计算球心（在原点）
    const center = new THREE.Vector3(0, 0, 0);
    
    // 计算源点和目标点的中点
    const midPoint = new THREE.Vector3().addVectors(source.position, target.position).multiplyScalar(0.5);
    
    // 计算从中点到球心的向量
    const centerToMid = new THREE.Vector3().subVectors(center, midPoint);
    
    // 计算控制点
    // 控制点会受到球心的影响，距离球心越远，弯曲程度越大
    const distance = midPoint.length(); // 到球心的距离
    const curveFactor = Math.min(distance * 0.5, 100); // 限制最大弯曲程度
    
    // 将控制点向球心方向移动
    const controlPoint = midPoint.clone().add(
      centerToMid.normalize().multiplyScalar(curveFactor)
    );

    // 创建二次贝塞尔曲线的点
    const curve = new THREE.QuadraticBezierCurve3(
      source.position,
      controlPoint,
      target.position
    );

    // 生成曲线上的点
    const points = curve.getPoints(50); // 50个点以确保曲线平滑
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // 根据边的类型设置不同的颜色
    let edgeColor;
    switch(edgeData.type) {
      // 层次关系 - 暖色调
      case 'is-a':
        edgeColor = '#FF7676'; // 鲜红色
        break;
      case 'contains':
        edgeColor = '#FF9F45'; // 橙色
        break;
      case 'belongs-to':
        edgeColor = '#FFC436'; // 金色
        break;

      // 依赖关系 - 冷色调
      case 'requires':
        edgeColor = '#45B7D1'; // 蓝色
        break;
      case 'depends':
        edgeColor = '#4477CE'; // 深蓝色
        break;
      case 'implements':
        edgeColor = '#3876BF'; // 靛蓝色
        break;

      // 动作关系 - 绿色系
      case 'performs':
        edgeColor = '#96CEB4'; // 薄荷绿
        break;
      case 'uses':
        edgeColor = '#7AB800'; // 草绿色
        break;
      case 'provides':
        edgeColor = '#4CAF50'; // 翠绿色
        break;
      case 'obtains':
        edgeColor = '#88B04B'; // 橄榄绿
        break;

      // 时序关系 - 紫色系
      case 'before':
        edgeColor = '#9B6B9E'; // 浅紫色
        break;
      case 'after':
        edgeColor = '#845EC2'; // 深紫色
        break;
      case 'during':
        edgeColor = '#BE93D4'; // 淡紫色
        break;
      case 'sequence':
        edgeColor = '#A084E8'; // 亮紫色
        break;

      // 关联关系 - 靛蓝色系（与节点颜色一致）
      case 'context':
        edgeColor = '#6366F1'; // 主色调
        break;
      case 'similar':
        edgeColor = '#818CF8'; // 浅靛蓝
        break;
      case 'related':
        edgeColor = '#4F46E5'; // 深靛蓝
        break;
      case 'and':
        edgeColor = '#5B5EF4'; // 中靛蓝
        break;

      // 方向关系 - 粉色系
      case 'to':
        edgeColor = '#FF8FB1'; // 粉红色
        break;
      case 'from':
        edgeColor = '#FC7FB6'; // 深粉色
        break;
      case 'towards':
        edgeColor = '#FDA4BA'; // 浅粉色
        break;

      // 逻辑关系 - 灰色系
      case 'if-then':
        edgeColor = '#7D7C7C'; // 深灰色
        break;
      case 'therefore':
        edgeColor = '#9DB2BF'; // 蓝灰色
        break;

      // 修饰关系 - 棕色系
      case 'of':
        edgeColor = '#C4A484'; // 棕色
        break;
      case 'degree':
        edgeColor = '#B4846C'; // 深棕色
        break;

      default:
        edgeColor = theme.edge.color; // 默认颜色
    }
    
    // 创建发光材质
    const material = new THREE.LineBasicMaterial({
      color: edgeColor,
      transparent: true,
      opacity: theme.edge.opacity,
      linewidth: theme.edge.width
    });

    const line = new THREE.Line(geometry, material);
    group.add(line);

    // 添加粒子系统
    const particles = createParticleSystem(source.position, target.position);
    group.add(particles);

    // 添加用户数据
    group.userData = {
      ...edgeData,
      isEdge: true,
      source: source,
      target: target,
      controlPoint: controlPoint // 存储控制点以便后续更新
    };

    // 更新边的位置的方法
    group.updatePosition = () => {
      // 更新中点和控制点
      const newMidPoint = new THREE.Vector3().addVectors(source.position, target.position).multiplyScalar(0.5);
      const newCenterToMid = new THREE.Vector3().subVectors(center, newMidPoint);
      const newDistance = newMidPoint.length();
      const newCurveFactor = Math.min(newDistance * 0.5, 100);
      
      const newControlPoint = newMidPoint.clone().add(
        newCenterToMid.normalize().multiplyScalar(newCurveFactor)
      );

      // 更新曲线
      const newCurve = new THREE.QuadraticBezierCurve3(
        source.position,
        newControlPoint,
        target.position
      );

      // 更新几何体
      const newPoints = newCurve.getPoints(50);
      geometry.setFromPoints(newPoints);
      geometry.computeBoundingSphere();
    };

    // 更新动画
    const updateParticles = () => {
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const t = (Date.now() * theme.edge.particles.speed + i) % 1;
        positions[i] = source.position.x + (target.position.x - source.position.x) * t;
        positions[i + 1] = source.position.y + (target.position.y - source.position.y) * t;
        positions[i + 2] = source.position.z + (target.position.z - source.position.z) * t;
      }
      particles.geometry.attributes.position.needsUpdate = true;
    };
    
    return { line, particles };
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
    
    // 重置到初始视角
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);
    
    // 重置控制器
    controls.reset();
    controls.target.set(0, 0, 0);
    controls.update();
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    const cleanup = initScene();
    const resizeHandler = () => {
      handleResize();
      checkMobile();
    };

    // 统一管理所有事件监听器
    const eventListeners = new Map([
      ['resize', { target: window, handler: resizeHandler }],
      ['touchstart', { target: containerRef.current, handler: handleTouchStart }],
      ['touchmove', { target: containerRef.current, handler: handleTouchMove }],
      ['touchend', { target: containerRef.current, handler: handleTouchEnd }]
    ]);

    // 添加所有事件监听器
    eventListeners.forEach(({ target, handler }, eventName) => {
      target.addEventListener(eventName, handler);
    });

    // 返回清理函数
    return () => {
      // 移除所有事件监听器
      eventListeners.forEach(({ target, handler }, eventName) => {
        target.removeEventListener(eventName, handler);
      });

      // 清理Three.js资源
      if (sceneRef.current) {
        const { scene, renderer, labelRenderer, controls } = sceneRef.current;
        
        // 停止动画循环
        cancelAnimationFrame(sceneRef.current.animationFrameId);
        
        // 清理渲染器
        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement?.remove();
        }
        
        // 清理标签渲染器
        if (labelRenderer) {
          labelRenderer.domElement?.remove();
        }
        
        // 清理控制器
        if (controls) {
          controls.dispose();
        }
        
        // 清理场景中的所有对象
        if (scene) {
          const disposeObject = (obj) => {
            if (obj.geometry) {
              obj.geometry.dispose();
            }
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => {
                  if (mat.map) mat.map.dispose();
                  mat.dispose();
                });
              } else {
                if (obj.material.map) obj.material.map.dispose();
                obj.material.dispose();
              }
            }
            if (obj.children) {
              obj.children.forEach(disposeObject);
            }
          };
          
          scene.traverse(disposeObject);
          scene.clear();
        }
        
        // 重置引用
        sceneRef.current = null;
      }

      // 执行初始化场景返回的清理函数
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !data) return;
    
    const { scene, camera, renderer } = sceneRef.current;
    if (!scene || !camera || !renderer) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredNode = null;

    const onMouseMove = (event) => {
      // 确保所有必要的引用都存在
      if (!sceneRef.current?.camera || !sceneRef.current?.scene) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // 处理节点悬停效果
      handleNodeHover(intersects, hoveredNode);
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);

    return () => {
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
    };
  }, [data]);

  // 添加新的节点悬停处理函数
  const handleNodeHover = (intersects, hoveredNode) => {
    // 找到第一个是球体的相交对象
    const nodeIntersect = intersects.find(intersect => 
      intersect.object?.type === 'Mesh' && 
      intersect.object?.geometry?.type === 'SphereGeometry'
    );

    // 如果之前有悬浮的节点，恢复其状态
    if (hoveredNode && (!nodeIntersect || nodeIntersect.object !== hoveredNode)) {
      resetNodeHoverState(hoveredNode);
      hoveredNode = null;
    }

    // 如果找到新的节点，应用悬浮效果
    if (nodeIntersect && nodeIntersect.object && nodeIntersect.object !== hoveredNode) {
      applyNodeHoverEffect(nodeIntersect.object);
      hoveredNode = nodeIntersect.object;
    }

    return hoveredNode;
  };

  // 重置节点悬停状态
  const resetNodeHoverState = (node) => {
    if (node.material && node.userData) {
      const material = node.material;
      if (material.color && material.color.set && node.userData.originalColor) {
        material.color.set(node.userData.originalColor);
      }
      node.userData.isHovered = false;
      
      // 更新发光效果
      const glowSphere = node.parent?.children?.[1];
      if (glowSphere?.material?.uniforms) {
        glowSphere.material.uniforms.c.value = 0.5;
        glowSphere.material.uniforms.p.value = 1.4;
      }
    }
  };

  // 应用节点悬停效果
  const applyNodeHoverEffect = (node) => {
    if (node.material && node.material.color && node.material.color.set) {
      node.material.color.set(theme.node.highlightColor);
    }
    if (node.userData) {
      node.userData.isHovered = true;
    }
    
    // 增强发光效果
    const glowSphere = node.parent?.children?.[1];
    if (glowSphere?.material?.uniforms) {
      glowSphere.material.uniforms.c.value = 0.8;
      glowSphere.material.uniforms.p.value = 2.0;
    }
  };

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