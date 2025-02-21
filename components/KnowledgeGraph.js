import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress, faSearch, faRefresh, faSave, faDownload } from '@fortawesome/free-solid-svg-icons';

const KnowledgeGraph = ({ data, onNodeClick, style = {} }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  
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
    if (!containerRef.current) return null;
    
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

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
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    container.appendChild(labelRenderer.domElement);

    return {
      scene,
      camera,
      renderer,
      labelRenderer,
      controls,
      width,
      height
    };
  };

  const handleResize = () => {
    if (!sceneRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const { camera, renderer, labelRenderer } = sceneRef.current;
    const newWidth = container.clientWidth || 800;
    const newHeight = container.clientHeight || 600;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
    labelRenderer.setSize(newWidth, newHeight);
  };

  const createNode3D = (nodeData, index, total) => {
    const group = new THREE.Group();

    // 使用节点的实际大小，如果没有则使用默认大小
    const nodeSize = nodeData.size || theme.node.size;

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
    // 根据节点大小调整标签大小
    const fontSize = Math.max(12, Math.min(16, 12 + (nodeSize - 10) / 2));
    labelDiv.style.fontSize = `${fontSize}px`;
    labelDiv.style.fontFamily = theme.label.font;
    labelDiv.style.background = 'rgba(255,255,255,0.8)';
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
    group.userData = {
      ...nodeData,
      size: nodeSize
    };

    return group;
  };

  const createEdge3D = (source, target, edgeData) => {
    const group = new THREE.Group();

    // 创建曲线路径
    const curve = edgeData.curve;
    let points;
    if (curve) {
      // 使用二次贝塞尔曲线
      const curveObject = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(curve.x1, curve.y1, 0),
        new THREE.Vector3(curve.cpx, curve.cpy, 0),
        new THREE.Vector3(curve.x2, curve.y2, 0)
      );
      points = curveObject.getPoints(50);
    } else {
      points = [source.position, target.position];
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // 创建发光材质
    const material = new THREE.LineBasicMaterial({
      color: edgeData.color || theme.edge.color,
      transparent: true,
      opacity: theme.edge.opacity,
      linewidth: edgeData.width || theme.edge.width
    });

    const line = new THREE.Line(geometry, material);
    
    // 添加发光效果
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(edgeData.color || theme.edge.color) },
        opacity: { value: 0.35 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        varying vec2 vUv;
        void main() {
          float intensity = 1.0 - length(vUv - vec2(0.5));
          gl_FragColor = vec4(color, opacity * intensity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const glowLine = new THREE.Line(geometry, glowMaterial);
    glowLine.scale.multiplyScalar(1.2);
    group.add(glowLine);
    group.add(line);

    // 添加边标签
    if (edgeData.label) {
      const labelDiv = document.createElement('div');
      labelDiv.className = 'edge-label';
      labelDiv.textContent = edgeData.label;
      labelDiv.style.color = theme.label.color;
      labelDiv.style.fontSize = '12px';
      labelDiv.style.fontFamily = theme.label.font;
      labelDiv.style.background = 'rgba(255,255,255,0.8)';
      labelDiv.style.padding = '2px 6px';
      labelDiv.style.borderRadius = '4px';
      labelDiv.style.whiteSpace = 'nowrap';
      labelDiv.style.pointerEvents = 'none';
      labelDiv.style.userSelect = 'none';
      
      const label = new CSS2DObject(labelDiv);
      
      // 如果有曲线，将标签放在控制点位置
      if (curve) {
        label.position.set(curve.cpx, curve.cpy, 0);
      } else {
        // 否则放在边的中点
        const midPoint = new THREE.Vector3()
          .addVectors(source.position, target.position)
          .multiplyScalar(0.5);
        label.position.copy(midPoint);
      }
      
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
      if (curve) {
        const curveObject = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(curve.x1, curve.y1, 0),
          new THREE.Vector3(curve.cpx, curve.cpy, 0),
          new THREE.Vector3(curve.x2, curve.y2, 0)
        );
        const points = curveObject.getPoints(50);
        geometry.setFromPoints(points);
      } else {
        const positions = new Float32Array([
          source.position.x, source.position.y, source.position.z,
          target.position.x, target.position.y, target.position.z
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      }
      geometry.computeBoundingSphere();
      
      // 更新标签位置
      if (group.children[2]) {
        const label = group.children[2];
        if (curve) {
          label.position.set(curve.cpx, curve.cpy, 0);
        } else {
          const midPoint = new THREE.Vector3()
            .addVectors(source.position, target.position)
            .multiplyScalar(0.5);
          label.position.copy(midPoint);
        }
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
    const scene = initScene();
    if (scene) {
      sceneRef.current = scene;
    }

    return () => {
      if (sceneRef.current) {
        const { renderer, labelRenderer, controls } = sceneRef.current;
        renderer.dispose();
        labelRenderer.domElement.remove();
        controls.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !data) return;

    const { scene } = sceneRef.current;

    // 清除现有内容
    while (scene.children.length > 0) {
      const obj = scene.children[0];
      if (obj.material) {
        obj.material.dispose();
      }
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      scene.remove(obj);
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
      
      controls.update();

      // 更新所有边的位置和标签
      scene.children.forEach(child => {
        if (child.userData?.isEdge && child.updatePosition) {
          child.updatePosition();
        }
      });

      // 更新节点发光效果
      scene.traverse((object) => {
        if (object.material?.uniforms?.viewVector) {
          object.material.uniforms.viewVector.value = camera.position;
        }
      });

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [data]);

  useEffect(() => {
    if (isValidData && sceneRef.current) {
      // 不再需要renderEdges，因为边的创建已经在主useEffect中处理
    }
  }, [data, isValidData]);

  return (
    <div className="knowledge-graph-container" style={{ width: '100%', height: '100%', ...style }}>
      {!isValidData && (
        <div className="empty-state">
          <p>暂无可视化数据</p>
        </div>
      )}
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