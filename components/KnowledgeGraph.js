import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress, faSearch, faRefresh, faSave, faDownload } from '@fortawesome/free-solid-svg-icons';
import SelectedNodes from './SelectedNodes';

const KnowledgeGraph = ({ data, onNodeClick, settings = {} }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  
  const themeColors = {
    default: {
      node: '#1f77b4',
      edge: '#ff7f0e',
      highlight: '#2ecc71'
    },
    dark: {
      node: '#2c3e50',
      edge: '#34495e',
      highlight: '#e74c3c'
    },
    nature: {
      node: '#27ae60',
      edge: '#2ecc71',
      highlight: '#f1c40f'
    },
    warm: {
      node: '#e74c3c',
      edge: '#c0392b',
      highlight: '#f39c12'
    }
  };

  const currentTheme = themeColors[settings.theme || 'default'];

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

  const initScene = useCallback(() => {
    if (!containerRef.current || !data) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });

    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 0);
    containerRef.current.appendChild(renderer.domElement);

    // 调整相机位置以获得更好的视角
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    const nodes = new THREE.Group();
    const edges = new THREE.Group();
    scene.add(nodes);
    scene.add(edges);

    // 创建节点
    data.nodes.forEach(node => {
      const nodeObj = createNode3D(node, settings.nodeSize || 10, settings.nodeOpacity || 0.9);
      nodes.add(nodeObj);
    });

    // 创建边
    data.edges.forEach(edge => {
      const edgeObj = createEdge3D(
        edge,
        nodes,
        settings.lineStyle === 'curve',
        settings.lineWidth || 2,
        currentTheme.edge
      );
      if (edgeObj) {
        edges.add(edgeObj);
      }
    });

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
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.panSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.screenSpacePanning = true;

    // 清除原有内容并添加新的渲染器
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    containerRef.current.appendChild(labelRenderer.domElement);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      labelRenderer,
      controls,
      width,
      height,
      nodes,
      edges
    };

    // 添加事件监听
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, [data, settings, currentTheme]);

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
      return settings.nodeSize || 10;
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
    const size = settings.nodeSize || 10 + 
      (settings.nodeSize || 10 - 10) * 
      (Math.pow(base, normalizedConnections) - 1) / (base - 1);

    return size;
  };

  const createNode3D = useCallback((node, size = 10, opacity = 0.9) => {
    const geometry = new THREE.SphereGeometry(size / 10, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: currentTheme.node,
      transparent: true,
      opacity: opacity,
      shininess: 50,
      specular: 0x444444
    });
    const sphere = new THREE.Mesh(geometry, material);

    // 调整节点的初始位置分布范围
    sphere.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );

    sphere.userData = { ...node };
    return sphere;
  }, [currentTheme]);

  const createEdge3D = useCallback((edge, nodes, isCurved = true, width = 2, color) => {
    const startNode = nodes.children.find(n => n.userData.id === edge.source);
    const endNode = nodes.children.find(n => n.userData.id === edge.target);

    if (!startNode || !endNode) return null;

    let points;
    if (isCurved) {
      const midPoint = new THREE.Vector3().addVectors(
        startNode.position,
        endNode.position
      ).multiplyScalar(0.5);
      
      // 调整曲线的弧度
      const distance = startNode.position.distanceTo(endNode.position);
      midPoint.y += distance * 0.2;

      const curve = new THREE.QuadraticBezierCurve3(
        startNode.position,
        midPoint,
        endNode.position
      );
      points = curve.getPoints(50);
    } else {
      points = [startNode.position, endNode.position];
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: width,
      transparent: true,
      opacity: 0.8
    });

    return new THREE.Line(geometry, material);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleNodeClick = useCallback((node) => {
    const nodeData = node.userData;
    const isSelected = selectedNodes.some(n => n.id === nodeData.id);
    
    if (isSelected) {
      // 如果已经选中，则取消选中
      setSelectedNodes(prevNodes => prevNodes.filter(n => n.id !== nodeData.id));
      node.material.color.setHex(parseInt(currentTheme.node.replace('#', '0x')));
      // 更新发光效果
      const glowSphere = node.parent?.children?.[1];
      if (glowSphere?.material?.uniforms) {
        glowSphere.material.uniforms.c.value = 0.5;
        glowSphere.material.uniforms.p.value = 1.4;
      }
    } else {
      // 如果未选中，则添加到选中列表
      setSelectedNodes(prevNodes => [...prevNodes, nodeData]);
      node.material.color.setHex(parseInt(currentTheme.highlight.replace('#', '0x')));
      // 增强发光效果
      const glowSphere = node.parent?.children?.[1];
      if (glowSphere?.material?.uniforms) {
        glowSphere.material.uniforms.c.value = 0.8;
        glowSphere.material.uniforms.p.value = 2.0;
      }
    }
    
    // 添加动画效果
    const scale = isSelected ? 1.0 : 1.3;
    node.scale.set(scale, scale, scale);
    
    onNodeClick && onNodeClick(nodeData);
  }, [selectedNodes, currentTheme, onNodeClick]);

  const handleRemoveNode = (node) => {
    setSelectedNodes(selectedNodes.filter(n => n.id !== node.id));
    // 找到对应的3D节点并恢复颜色
    const scene = sceneRef.current?.scene;
    if (scene) {
      scene.traverse((object) => {
        if (object.userData && object.userData.id === node.id) {
          object.material.color.setHex(parseInt(currentTheme.node.replace('#', '0x')));
        }
      });
    }
  };

  const handleSearch = async (nodes) => {
    if (onNodeClick) {
      await onNodeClick(nodes);
    }
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
    return () => {
      cleanup && cleanup();
    };
  }, [initScene]);

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
        
        const node3D = createNode3D(nodeData, calculateNodeSize(nodeData), settings.nodeOpacity || 0.9);
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
            const edge3D = createEdge3D(
              edgeData,
              sceneRef.current.nodes,
              settings.lineStyle === 'curve',
              settings.lineWidth || 2,
              currentTheme.edge
            );
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
  }, [data, isValidData, createEdge3D, createNode3D, handleNodeClick]);

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
          if (hoveredNode.scale && hoveredNode.scale.copy && hoveredNode.userData.originalScale) {
            hoveredNode.scale.copy(hoveredNode.userData.originalScale);
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
          node.material.color.set(currentTheme.highlight);
        }
        if (node.scale && node.scale.copy && node.userData?.hoverScale) {
          node.scale.copy(node.userData.hoverScale);
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
  }, [data, currentTheme]);

  return (
    <div className="knowledge-graph-container" style={{ width: '100%', height: '100%', ...settings }}>
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