import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import popper from 'cytoscape-popper';
import tippy from 'tippy.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faExpand, faCompress, faSearch, faRefresh, faSave, faDownload, faCube, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import 'tippy.js/dist/tippy.css';

// 注册布局插件
cytoscape.use(cola);
cytoscape.use(popper);

const KnowledgeGraph = ({ data, onNodeClick, onEdgeClick, style = {} }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const threeRef = useRef(null);
  const rendererRef = useRef(null);
  const labelRendererRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [is3D, setIs3D] = useState(false);
  
  // 主题配置
  const theme = {
    node: {
      normal: {
        color: new THREE.Color(0x6366F1),
        emissive: new THREE.Color(0x4338CA),
        specular: new THREE.Color(0xFFFFFF)
      },
      selected: {
        color: new THREE.Color(0xF43F5E),
        emissive: new THREE.Color(0xBE123C),
        specular: new THREE.Color(0xFFFFFF)
      }
    },
    edge: {
      color: new THREE.Color(0x94A3B8),
      opacity: 0.6
    },
    background: new THREE.Color(0x0F172A)
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

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
      setZoom(cyRef.current.zoom());
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
      setZoom(cyRef.current.zoom());
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(50);
      cyRef.current.center();
    }
  };

  const handleExport = () => {
    if (cyRef.current) {
      const png = cyRef.current.png({
        full: true,
        scale: 2,
        quality: 1
      });
      const link = document.createElement('a');
      link.href = png;
      link.download = 'knowledge-graph.png';
      link.click();
    }
  };

  // 初始化Three.js场景
  const initThreeScene = () => {
    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = theme.background;
    scene.fog = new THREE.FogExp2(theme.background, 0.001);

    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 500;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;

    // 创建标签渲染器
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';

    // 添加控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 100;
    controls.maxDistance = 800;

    // 添加环境光和点光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);

    // 添加全局光晕
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.5,  // 强度
      0.4,  // 半径
      0.85  // 阈值
    );
    
    // 清除原有内容并添加新的渲染器
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.appendChild(labelRenderer.domElement);

    // 保存引用
    threeRef.current = {
      scene,
      camera,
      controls,
      width,
      height,
      pointLight
    };
    rendererRef.current = renderer;
    labelRendererRef.current = labelRenderer;

    // 添加窗口大小调整监听
    window.addEventListener('resize', handleResize);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      // 旋转点光源
      pointLight.position.x = Math.sin(Date.now() * 0.001) * 100;
      pointLight.position.z = Math.cos(Date.now() * 0.001) * 100;
      
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();
  };

  // 处理窗口大小调整
  const handleResize = () => {
    if (!threeRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const { camera } = threeRef.current;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    rendererRef.current.setSize(width, height);
    labelRendererRef.current.setSize(width, height);
  };

  // 创建3D节点
  const createNode3D = (nodeData, index, total) => {
    const group = new THREE.Group();

    // 创建发光球体
    const geometry = new THREE.SphereGeometry(10, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: theme.node.normal.color,
      emissive: theme.node.normal.emissive,
      specular: theme.node.normal.specular,
      shininess: 50,
      transparent: true,
      opacity: 0.9
    });
    const sphere = new THREE.Mesh(geometry, material);
    
    // 添加发光效果
    const glowGeometry = new THREE.SphereGeometry(12, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        c: { type: "f", value: 0.5 },
        p: { type: "f", value: 3.0 },
        glowColor: { type: "c", value: new THREE.Color(0x6366F1) },
        viewVector: { type: "v3", value: threeRef.current.camera.position }
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
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glowMesh);
    
    group.add(sphere);

    // 创建标签
    const labelDiv = document.createElement('div');
    labelDiv.className = 'node-label';
    labelDiv.textContent = nodeData.label;
    const label = new CSS2DObject(labelDiv);
    label.position.set(0, 15, 0);
    group.add(label);

    // 计算位置
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    const radius = 200;

    group.position.x = radius * Math.cos(theta) * Math.sin(phi);
    group.position.y = radius * Math.sin(theta) * Math.sin(phi);
    group.position.z = radius * Math.cos(phi);

    // 添加交互事件
    group.userData = nodeData;
    group.userData.isNode = true;

    return group;
  };

  // 创建3D连接线
  const createEdge3D = (source, target) => {
    const points = [];
    points.push(new THREE.Vector3(source.position.x, source.position.y, source.position.z));
    points.push(new THREE.Vector3(target.position.x, target.position.y, target.position.z));

    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 20, 0.5, 8, false);
    const material = new THREE.MeshPhongMaterial({
      color: theme.edge.color,
      transparent: true,
      opacity: theme.edge.opacity,
      emissive: theme.edge.color,
      emissiveIntensity: 0.2
    });

    return new THREE.Mesh(geometry, material);
  };

  // 渲染3D图
  const render3D = () => {
    if (!data || !data.nodes || !data.edges) return;

    initThreeScene();
    const { scene } = threeRef.current;

    // 创建节点
    const nodes3D = new Map();
    data.nodes.forEach((node, index) => {
      const node3D = createNode3D(node.data, index, data.nodes.length);
      scene.add(node3D);
      nodes3D.set(node.data.id, node3D);
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

    // 添加射线检测器用于交互
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, threeRef.current.camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let hoveredNode = null;
      for (let i = 0; i < intersects.length; i++) {
        const object = intersects[i].object;
        if (object.parent && object.parent.userData && object.parent.userData.isNode) {
          hoveredNode = object.parent;
          break;
        }
      }

      scene.traverse((object) => {
        if (object.userData && object.userData.isNode) {
          const material = object.children[0].material;
          if (object === hoveredNode) {
            material.emissiveIntensity = 1;
            material.color = theme.node.selected.color;
          } else {
            material.emissiveIntensity = 0.5;
            material.color = theme.node.normal.color;
          }
        }
      });
    };

    const onClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, threeRef.current.camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (let i = 0; i < intersects.length; i++) {
        const object = intersects[i].object;
        if (object.parent && object.parent.userData && object.parent.userData.isNode) {
          setSelectedNode(object.parent.userData);
          onNodeClick && onNodeClick(object.parent.userData);
          break;
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
    };
  };

  const toggleView = () => {
    setIs3D(!is3D);
    if (!is3D) {
      render3D();
    } else {
      // 切回2D视图
      if (cyRef.current) {
        cyRef.current.destroy();
      }
      initCytoscape();
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // 初始化图实例
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': theme.node.normal.backgroundColor,
            'border-color': theme.node.normal.borderColor,
            'border-width': theme.node.normal.borderWidth,
            'label': 'data(label)',
            'color': theme.node.normal.labelColor,
            'font-size': '12px',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-outline-color': theme.node.normal.backgroundColor,
            'text-outline-width': '2px',
            'transition-property': 'background-color, border-color, border-width, width, height',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': theme.edge.normal.width,
            'line-color': theme.edge.normal.lineColor,
            'opacity': theme.edge.normal.opacity,
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-margin-y': '-10px',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': theme.edge.normal.lineColor,
            'arrow-scale': 0.8,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: ':selected',
          style: {
            'background-color': theme.node.selected.backgroundColor,
            'border-color': theme.node.selected.borderColor,
            'border-width': theme.node.selected.borderWidth,
            'box-shadow': '0 0 10px rgba(244, 63, 94, 0.6)'
          }
        },
        {
          selector: '.hover',
          style: {
            'background-color': theme.node.hover.backgroundColor,
            'border-color': theme.node.hover.borderColor,
            'border-width': theme.node.hover.borderWidth
          }
        },
        {
          selector: '.hover-edge',
          style: {
            'line-color': theme.edge.hover.lineColor,
            'width': theme.edge.hover.width,
            'opacity': theme.edge.hover.opacity,
            'target-arrow-color': theme.edge.hover.lineColor
          }
        }
      ],
      layout: {
        name: 'cola',
        animate: true,
        refresh: 1,
        maxSimulationTime: 4000,
        nodeSpacing: 30,
        edgeLength: 200,
        randomize: false,
        infinite: true
      },
      minZoom: 0.2,
      maxZoom: 3,
      zoomingEnabled: true,
      userZoomingEnabled: true,
      panningEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      selectionType: 'single',
      touchTapThreshold: 8,
      desktopTapThreshold: 4,
      autolock: false,
      autoungrabify: false,
      autounselectify: false
    });

    // 添加事件监听
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data());
      onNodeClick && onNodeClick(node.data());
    });

    cyRef.current.on('mouseover', 'node', (evt) => {
      evt.target.addClass('hover');
    });

    cyRef.current.on('mouseout', 'node', (evt) => {
      evt.target.removeClass('hover');
    });

    cyRef.current.on('mouseover', 'edge', (evt) => {
      evt.target.addClass('hover-edge');
    });

    cyRef.current.on('mouseout', 'edge', (evt) => {
      evt.target.removeClass('hover-edge');
    });

    cyRef.current.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      onEdgeClick && onEdgeClick(edge.data());
    });

    // 添加工具提示
    cyRef.current.nodes().forEach(node => {
      makeTippy(node, {
        content: () => {
          const data = node.data();
          return `
            <div class="p-2">
              <h3 class="font-bold">${data.label}</h3>
              <p class="text-sm">${data.description || '暂无描述'}</p>
            </div>
          `;
        },
        placement: 'top',
        trigger: 'manual',
        hideOnClick: false,
        multiple: true,
        sticky: true
      });
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  // 更新数据
  useEffect(() => {
    if (!cyRef.current || !data) return;

    cyRef.current.elements().remove();
    cyRef.current.add(data);
    
    // 使用 cola 布局
    const layout = cyRef.current.layout({
      name: 'cola',
      animate: true,
      refresh: 1,
      maxSimulationTime: 4000,
      nodeSpacing: 30,
      edgeLength: 200,
      randomize: false,
      infinite: true,
      flow: { axis: 'y', minSeparation: 50 }
    });
    
    layout.run();

    // 自动适应视图
    setTimeout(() => {
      cyRef.current.fit(50);
      cyRef.current.center();
    }, 500);
  }, [data]);

  // 工具提示辅助函数
  const makeTippy = (node, options) => {
    const ref = node.popperRef();
    const dummyDomEle = document.createElement('div');
    const tip = tippy(dummyDomEle, {
      getReferenceClientRect: ref.getBoundingClientRect,
      ...options
    });

    node.on('mouseover', () => tip.show());
    node.on('mouseout', () => tip.hide());

    return tip;
  };

  // 初始化
  useEffect(() => {
    render3D();
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  return (
    <div className="knowledge-graph-container" style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, ...style }}>
      <div className="toolbar">
        <div className="toolbar-group">
          <button onClick={() => setZoom(zoom * 1.2)} className="toolbar-button" title="放大">
            <FontAwesomeIcon icon={faSearch} className="mr-1" />+
          </button>
          <button onClick={() => setZoom(zoom * 0.8)} className="toolbar-button" title="缩小">
            <FontAwesomeIcon icon={faSearch} className="mr-1" />-
          </button>
          <button onClick={() => {
            if (threeRef.current) {
              threeRef.current.camera.position.set(0, 0, 500);
              threeRef.current.controls.reset();
            }
          }} className="toolbar-button" title="重置视图">
            <FontAwesomeIcon icon={faRefresh} />
          </button>
        </div>
        <div className="toolbar-group">
          <button onClick={() => {
            if (!document.fullscreenElement) {
              containerRef.current.requestFullscreen();
              setIsFullscreen(true);
            } else {
              document.exitFullscreen();
              setIsFullscreen(false);
            }
          }} className="toolbar-button" title="全屏">
            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
          </button>
          <button onClick={() => {
            if (rendererRef.current) {
              const imgData = rendererRef.current.domElement.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = imgData;
              link.download = 'knowledge-graph-3d.png';
              link.click();
            }
          }} className="toolbar-button" title="导出图片">
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
          <h3 className="text-lg font-semibold mb-2">{selectedNode.label}</h3>
          <p className="text-sm text-gray-600">{selectedNode.description || '暂无描述'}</p>
        </div>
      )}
      
      <style jsx>{`
        .knowledge-graph-container {
          background: var(--neutral-900);
          overflow: hidden;
        }
        
        .toolbar {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 16px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          z-index: 1000;
        }

        .toolbar-group {
          display: flex;
          gap: 8px;
          padding: 0 8px;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
        }

        .toolbar-group:last-child {
          border-right: none;
        }

        .toolbar-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toolbar-button:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          transform: translateY(-1px);
        }

        .discord-button {
          color: #5865F2;
        }

        .discord-button:hover {
          background: rgba(88, 101, 242, 0.2);
        }

        .github-button {
          color: #fff;
        }

        .github-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .node-details-panel {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          color: white;
          max-width: 300px;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        :global(.node-label) {
          color: white;
          font-size: 12px;
          padding: 2px 4px;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 4px;
          pointer-events: none;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default KnowledgeGraph;