import * as THREE from 'three';
import { Node } from '../types/graph';

export class AnimationController {
  private camera: THREE.PerspectiveCamera;
  private controls: any;
  private animationFrame: number | null = null;
  private currentAnimation: string | null = null;

  constructor(camera: THREE.PerspectiveCamera, controls: any) {
    this.camera = camera;
    this.controls = controls;
  }

  // 聚焦到指定节点
  focusOnNode(node: Node, duration: number = 1000) {
    if (!node.position) return;

    // 如果正在进行其他动画，先取消
    if (this.currentAnimation) {
      this.cancelAnimation();
    }

    this.currentAnimation = 'focus';
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    
    // 计算目标位置
    const nodePosition = new THREE.Vector3(
      node.position.x,
      node.position.y,
      node.position.z
    );
    const cameraOffset = new THREE.Vector3(20, 20, 30);
    const targetPosition = nodePosition.clone().add(cameraOffset);
    const targetTarget = nodePosition.clone();

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      if (this.currentAnimation !== 'focus') return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数使动画更平滑
      const eased = this.easeInOutCubic(progress);

      // 插值计算当前位置
      const currentPosition = new THREE.Vector3().lerpVectors(startPosition, targetPosition, eased);
      const currentTarget = new THREE.Vector3().lerpVectors(startTarget, targetTarget, eased);

      this.camera.position.copy(currentPosition);
      this.controls.target.copy(currentTarget);
      this.controls.update();

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.currentAnimation = null;
      }
    };

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  // 重置视图
  resetView(duration: number = 1000) {
    // 如果正在进行其他动画，先取消
    if (this.currentAnimation) {
      this.cancelAnimation();
    }

    this.currentAnimation = 'reset';
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    
    const targetPosition = new THREE.Vector3(0, 0, 50);
    const targetTarget = new THREE.Vector3(0, 0, 0);

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      if (this.currentAnimation !== 'reset') return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const eased = this.easeInOutCubic(progress);

      const currentPosition = new THREE.Vector3().lerpVectors(startPosition, targetPosition, eased);
      const currentTarget = new THREE.Vector3().lerpVectors(startTarget, targetTarget, eased);

      this.camera.position.copy(currentPosition);
      this.controls.target.copy(currentTarget);
      this.controls.update();

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.currentAnimation = null;
      }
    };

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  // 取消当前动画
  private cancelAnimation() {
    this.currentAnimation = null;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  // 缓动函数
  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // 清理动画
  dispose() {
    this.cancelAnimation();
  }
} 