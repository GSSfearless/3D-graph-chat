"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
// 修改导入方式，使用简化版控制器替代OrbitControls
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export function KnowledgeGraphDemo() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 初始化场景
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf9fafb)

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 200

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)

    // 添加基本旋转逻辑代替OrbitControls
    let rotationSpeed = 0.001
    let mouseDown = false
    let lastMouseX = 0
    
    const handleMouseDown = (e) => {
      mouseDown = true
      lastMouseX = e.clientX
    }
    
    const handleMouseUp = () => {
      mouseDown = false
    }
    
    const handleMouseMove = (e) => {
      if (mouseDown) {
        const deltaX = e.clientX - lastMouseX
        nodeGroup.rotation.y += deltaX * 0.005
        lastMouseX = e.clientX
      }
    }
    
    containerRef.current.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)

    // 创建节点和连接的数据
    const nodes = []
    const links = []
    const nodeCount = 30

    // 创建中心节点
    const centerNode = {
      position: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(0x3b82f6),
      size: 8,
    }
    nodes.push(centerNode)

    // 创建其他节点
    for (let i = 1; i < nodeCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 30 + Math.random() * 100
      const height = -50 + Math.random() * 100

      const x = Math.cos(angle) * radius
      const y = height
      const z = Math.sin(angle) * radius

      const node = {
        position: new THREE.Vector3(x, y, z),
        color: new THREE.Color(Math.random() * 0xffffff),
        size: 3 + Math.random() * 3,
      }

      nodes.push(node)

      // 随机连接到其他节点
      const linkCount = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < linkCount; j++) {
        const targetIndex = Math.floor(Math.random() * i)
        links.push({
          source: i,
          target: targetIndex,
        })
      }

      // 确保每个节点至少连接到中心节点的概率
      if (Math.random() > 0.7) {
        links.push({
          source: i,
          target: 0,
        })
      }
    }

    // 渲染节点
    const nodeGroup = new THREE.Group()
    scene.add(nodeGroup)

    nodes.forEach((node) => {
      const geometry = new THREE.SphereGeometry(node.size, 32, 32)
      const material = new THREE.MeshBasicMaterial({ color: node.color })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(node.position)
      nodeGroup.add(mesh)
    })

    // 渲染连接
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.6,
    })

    links.forEach((link) => {
      const sourceNode = nodes[link.source]
      const targetNode = nodes[link.target]

      const points = [sourceNode.position, targetNode.position]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geometry, lineMaterial)
      scene.add(line)
    })

    // 添加粒子背景
    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 300
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 500
      positions[i + 1] = (Math.random() - 0.5) * 500
      positions[i + 2] = (Math.random() - 0.5) * 500
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 1,
      transparent: true,
      opacity: 0.5,
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // 动画效果
    const animate = () => {
      requestAnimationFrame(animate)

      // 自动旋转节点群
      if (!mouseDown) {
        nodeGroup.rotation.y += rotationSpeed
      }

      renderer.render(scene, camera)
    }

    animate()

    // 响应窗口大小变化
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize)
      containerRef.current.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }

      // 释放资源
      scene.clear()
      nodeGroup.clear()
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
} 