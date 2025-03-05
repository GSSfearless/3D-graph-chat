import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress, faSearch, faRefresh, faSave, faDownload, faCube, faShare } from '@fortawesome/free-solid-svg-icons';
import ReactDOM from 'react-dom';

const KnowledgeGraph = ({ 
  data, 
  onNodeClick, 
  style = {},
  defaultMode = "2d",
  autoRotate = false,
  hideControls = false,
  disableLabels = false,
  disableZoom = false
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [is3DMode, setIs3DMode] = useState(defaultMode === "3d");
  
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
    // 将相机位置设置到合适观察距离
    camera.position.set(0, 0, 550);
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
    controls.autoRotate = autoRotate; // 根据传入参数设置自动旋转
    controls.autoRotateSpeed = 1.0; // 自动旋转速度
    controls.rotateSpeed = 0.8; // 降低旋转速度
    controls.panSpeed = 0.8; // 平移速度
    controls.zoomSpeed = 1.2; // 缩放速度
    controls.minDistance = 350; // 最小距离，防止过于靠近
    controls.maxDistance = 900; // 最大距离
    controls.target.set(0, 0, 0); // 设置旋转中心为原点（球心）
    controls.enablePan = true; // 允许平移
    controls.enableZoom = !disableZoom; // 根据disableZoom参数控制是否允许缩放
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
    if (!disableLabels) {
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
    }

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
    
    // 重置到初始视角
    camera.position.set(0, 0, 550);
    camera.lookAt(0, 0, 0);
    
    // 重置控制器
    controls.reset();
    controls.target.set(0, 0, 0);
    controls.update();
  };

  const handleRefreshLayout = () => {
    if (!sceneRef.current) return;
    
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
        
        // 规范化节点ID
        nodeData.id = normalizeId(nodeData.id);
        console.log('创建节点:', {
          原始ID: node.data.id,
          规范化ID: nodeData.id,
          标签: nodeData.label
        });
        
        const node3D = createNode3D(nodeData, index, data.nodes.length);
        scene.add(node3D);
        nodes3D.set(nodeData.id, node3D);
        // 同时存储原始ID的映射，以防边使用原始ID
        const originalId = String(node.data.id).trim();
        if (originalId !== nodeData.id) {
          nodes3D.set(originalId, node3D);
        }

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
        let sourceId, targetId;
        
        try {
          // 获取原始ID
          const rawSourceId = edgeData.source?.id || edgeData.source;
          const rawTargetId = edgeData.target?.id || edgeData.target;
          
          // 规范化ID
          sourceId = normalizeId(rawSourceId);
          targetId = normalizeId(rawTargetId);
          
          console.log('处理边:', {
            原始源节点ID: rawSourceId,
            原始目标节点ID: rawTargetId,
            规范化源节点ID: sourceId,
            规范化目标节点ID: targetId
          });
          
        } catch (error) {
          console.error('解析边的节点ID时出错:', error);
          return;
        }
        
        // 创建双向的边标识符
        const edgeKey1 = `${sourceId}-${targetId}`;
        const edgeKey2 = `${targetId}-${sourceId}`;
        
        // 如果这条边还没有被创建过
        if (!edgeMap.has(edgeKey1) && !edgeMap.has(edgeKey2)) {
          // 尝试多种方式获取节点
          const source = nodes3D.get(sourceId) || nodes3D.get(edgeData.source?.id) || nodes3D.get(edgeData.source);
          const target = nodes3D.get(targetId) || nodes3D.get(edgeData.target?.id) || nodes3D.get(edgeData.target);
          
          if (!source || !target) {
            console.warn(`边创建失败: ${sourceId} -> ${targetId}`, {
              源节点存在: !!source,
              目标节点存在: !!target,
              源节点ID: sourceId,
              目标节点ID: targetId,
              可用的节点ID列表: Array.from(nodes3D.keys())
            });
          } else {
            const edge3D = createEdge3D(source, target, {
              ...edgeData,
              label: edgeData.label || edgeData.type || '关系'
            });
            edge3D.userData.isEdge = true;
            scene.add(edge3D);
            edgeMap.set(edgeKey1, edge3D);
            console.log(`成功创建边: ${sourceId} -> ${targetId}`);
          }
        }
      });

    } catch (error) {
      console.error('Error creating 3D objects:', error);
    }

    // 动画循环
    const animate = () => {
      if (!sceneRef.current || !containerRef.current) return;
      
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

      // 存储动画帧ID以便清理
      sceneRef.current.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  };

  const toggleMode = () => {
    setIs3DMode(!is3DMode);
  };

  const handleSaveImage = () => {
    if (!sceneRef.current || !sceneRef.current.renderer) return;
    
    const dataUrl = sceneRef.current.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'knowledge-graph.png';
    link.click();
  };

  // 添加分享功能
  const handleShare = () => {
    // 获取当前URL
    const currentUrl = window.location.href;
    
    // 复制URL到剪贴板
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        // 显示提示信息
        alert('链接已复制到剪贴板，现在您可以分享给他人了！');
      })
      .catch(err => {
        console.error('无法复制链接: ', err);
        // 如果剪贴板API不可用，提示用户手动复制
        prompt('请手动复制此链接:', currentUrl);
      });
  };

  // 在组件挂载后添加分享按钮
  useEffect(() => {
    // 创建一个新的div元素作为分享按钮的容器
    const shareButtonContainer = document.createElement('div');
    shareButtonContainer.id = 'knowledge-graph-share-button';
    shareButtonContainer.style.position = 'fixed';
    shareButtonContainer.style.top = '20px';
    shareButtonContainer.style.right = '20px';
    shareButtonContainer.style.zIndex = '9999';
    
    // 将容器添加到body
    document.body.appendChild(shareButtonContainer);
    
    // 创建分享按钮
    const shareButton = document.createElement('button');
    shareButton.innerHTML = '<svg style="width:18px;height:18px;margin-right:6px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="currentColor" d="M307 34.8c-11.5 5.1-19 16.6-19 29.2v64H176C78.8 128 0 206.8 0 304C0 417.3 81.5 467.9 100.2 478.1c2.5 1.4 5.3 1.9 8.1 1.9c10.9 0 19.7-8.9 19.7-19.7c0-7.5-4.3-14.4-9.8-19.5C108.8 431.9 96 414.4 96 384c0-53 43-96 96-96h96v64c0 12.6 7.4 24.1 19 29.2s25 3 34.4-5.4l160-144c6.7-6.1 10.6-14.7 10.6-23.8s-3.8-17.7-10.6-23.8l-160-144c-9.4-8.5-22.9-10.6-34.4-5.4z"/></svg>分享';
    shareButton.style.display = 'flex';
    shareButton.style.alignItems = 'center';
    shareButton.style.justifyContent = 'center';
    shareButton.style.padding = '10px 20px';
    shareButton.style.backgroundColor = '#000';
    shareButton.style.color = '#fff';
    shareButton.style.border = 'none';
    shareButton.style.borderRadius = '8px';
    shareButton.style.fontWeight = 'bold';
    shareButton.style.fontSize = '16px';
    shareButton.style.cursor = 'pointer';
    shareButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    shareButton.style.transition = 'all 0.3s ease';
    
    // 添加悬停效果
    shareButton.addEventListener('mouseover', () => {
      shareButton.style.backgroundColor = '#333';
      shareButton.style.transform = 'translateY(-2px)';
      shareButton.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
    });
    
    shareButton.addEventListener('mouseout', () => {
      shareButton.style.backgroundColor = '#000';
      shareButton.style.transform = 'translateY(0)';
      shareButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    });
    
    // 添加点击事件
    shareButton.addEventListener('click', handleShare);
    
    // 将按钮添加到容器
    shareButtonContainer.appendChild(shareButton);
    
    // 组件卸载时移除按钮
    return () => {
      if (document.body.contains(shareButtonContainer)) {
        document.body.removeChild(shareButtonContainer);
      }
    };
  }, []);

  useEffect(() => {
    // 清理前一个场景
    if (sceneRef.current?.animationFrameId) {
      cancelAnimationFrame(sceneRef.current.animationFrameId);
    }
    
    if (sceneRef.current?.renderer) {
      sceneRef.current.renderer.dispose();
    }
    
    if (sceneRef.current?.controls) {
      sceneRef.current.controls.dispose();
    }

    // 初始化场景
    if (isValidData) {
      const cleanup = initScene();
      
      // 等待场景初始化完成后构建图谱
      setTimeout(() => {
        try {
          buildGraph();
          
          // 强制触发一次窗口调整大小事件，确保正确渲染
          window.dispatchEvent(new Event('resize'));
        } catch (error) {
          console.error('构建图谱时出错:', error);
        }
      }, 200);

      // 清理函数
      return () => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
        if (sceneRef.current?.animationFrameId) {
          cancelAnimationFrame(sceneRef.current.animationFrameId);
        }
      };
    }
  }, [data]);

  // 动画函数
  const animate = () => {
    if (!sceneRef.current || !containerRef.current) return;
    
    const { scene, camera, renderer, labelRenderer, controls } = sceneRef.current;
    
    // 检查是否有效场景
    if (!scene || !camera || !renderer || !labelRenderer) {
      return;
    }
    
    try {
      // 更新控制器
      controls.update();

      // 更新所有边的位置和标签
      scene.children.forEach(child => {
        if (child?.userData?.isEdge && typeof child.updatePosition === 'function') {
          child.updatePosition();
        }
      });

      // 更新节点发光效果
      scene.traverse((object) => {
        if (object?.material?.uniforms) {
          object.material.uniforms.viewVector.value = camera.position;
        }
      });

      // 渲染场景
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    } catch (error) {
      console.error('动画循环中出错:', error);
    }

    // 存储动画帧ID以便清理
    if (sceneRef.current) {
      sceneRef.current.animationFrameId = requestAnimationFrame(animate);
    }
  };

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
        
        // 规范化节点ID
        nodeData.id = normalizeId(nodeData.id);
        console.log('创建节点:', {
          原始ID: node.data.id,
          规范化ID: nodeData.id,
          标签: nodeData.label
        });
        
        const node3D = createNode3D(nodeData, index, data.nodes.length);
        scene.add(node3D);
        nodes3D.set(nodeData.id, node3D);
        // 同时存储原始ID的映射，以防边使用原始ID
        const originalId = String(node.data.id).trim();
        if (originalId !== nodeData.id) {
          nodes3D.set(originalId, node3D);
        }

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
        let sourceId, targetId;
        
        try {
          // 获取原始ID
          const rawSourceId = edgeData.source?.id || edgeData.source;
          const rawTargetId = edgeData.target?.id || edgeData.target;
          
          // 规范化ID
          sourceId = normalizeId(rawSourceId);
          targetId = normalizeId(rawTargetId);
          
          console.log('处理边:', {
            原始源节点ID: rawSourceId,
            原始目标节点ID: rawTargetId,
            规范化源节点ID: sourceId,
            规范化目标节点ID: targetId
          });
          
        } catch (error) {
          console.error('解析边的节点ID时出错:', error);
          return;
        }
        
        // 创建双向的边标识符
        const edgeKey1 = `${sourceId}-${targetId}`;
        const edgeKey2 = `${targetId}-${sourceId}`;
        
        // 如果这条边还没有被创建过
        if (!edgeMap.has(edgeKey1) && !edgeMap.has(edgeKey2)) {
          // 尝试多种方式获取节点
          const source = nodes3D.get(sourceId) || nodes3D.get(edgeData.source?.id) || nodes3D.get(edgeData.source);
          const target = nodes3D.get(targetId) || nodes3D.get(edgeData.target?.id) || nodes3D.get(edgeData.target);
          
          if (!source || !target) {
            console.warn(`边创建失败: ${sourceId} -> ${targetId}`, {
              源节点存在: !!source,
              目标节点存在: !!target,
              源节点ID: sourceId,
              目标节点ID: targetId,
              可用的节点ID列表: Array.from(nodes3D.keys())
            });
          } else {
            const edge3D = createEdge3D(source, target, {
              ...edgeData,
              label: edgeData.label || edgeData.type || '关系'
            });
            edge3D.userData.isEdge = true;
            scene.add(edge3D);
            edgeMap.set(edgeKey1, edge3D);
            console.log(`成功创建边: ${sourceId} -> ${targetId}`);
          }
        }
      });

    } catch (error) {
      console.error('Error creating 3D objects:', error);
    }

    // 动画循环
    const animate = () => {
      if (!sceneRef.current || !containerRef.current) return;
      
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

      // 存储动画帧ID以便清理
      sceneRef.current.animationFrameId = requestAnimationFrame(animate);
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
        intersect.object?.type === 'Mesh' && 
        intersect.object?.geometry?.type === 'SphereGeometry'
      );

      // 如果之前有悬浮的节点，恢复其状态
      if (hoveredNode && (!nodeIntersect || nodeIntersect.object !== hoveredNode)) {
        if (hoveredNode.material && hoveredNode.userData) {
          const material = hoveredNode.material;
          if (material.color && material.color.set && hoveredNode.userData.originalColor) {
            material.color.set(hoveredNode.userData.originalColor);
          }
          hoveredNode.userData.isHovered = false;
          
          // 更新发光效果
          const glowSphere = hoveredNode.parent?.children?.[1];
          if (glowSphere?.material?.uniforms) {
            glowSphere.material.uniforms.c.value = 0.5;
            glowSphere.material.uniforms.p.value = 1.4;
          }
        }
        hoveredNode = null;
      }

      // 如果找到新的节点，应用悬浮效果
      if (nodeIntersect && nodeIntersect.object && nodeIntersect.object !== hoveredNode) {
        const node = nodeIntersect.object;
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
        hoveredNode = node;
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);

    return () => {
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
    };
  }, [data]);

  return (
    <div 
      ref={containerRef} 
      className={`relative knowledge-graph-container ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`} 
      style={style}
    >
      {!isValidData && (
        <div className="empty-state">
          <p>暂无可视化数据</p>
        </div>
      )}
      
      {/* 原有工具栏 - 保持不可见 */}
      <div className="toolbar" style={{ 
        flexDirection: isMobile ? 'column' : 'row',
        right: isMobile ? '8px' : '16px',
        top: isMobile ? '8px' : '16px',
        display: 'none'  // 使工具栏不可见
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
            onClick={handleSaveImage}
            className="toolbar-button"
            title="导出图片"
          >
            <FontAwesomeIcon icon={faDownload} />
          </button>
        </div>
      </div>
      
      {/* 取消重复的containerRef引用，使用空div作为容器 */}
      <div style={{ width: '100%', height: '100%' }} onWheel={e => e.stopPropagation()} />
      
      <style jsx global>{`
        .knowledge-graph-container {
          position: relative;
          background: var(--neutral-50, #fafafa);
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

          .node-label {
            font-size: 10px;
            padding: 1px 2px;
          }

          .edge-label {
            font-size: 10px;
          }
          
          .share-button-fixed {
            padding: 6px 12px !important;
            top: 12px !important;
            right: 12px !important;
          }
          
          .share-button-fixed span {
            font-size: 12px !important;
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
          color: var(--neutral-600, #666);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toolbar-button:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--neutral-900, #333);
        }

        .node-label {
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

        .edge-label {
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