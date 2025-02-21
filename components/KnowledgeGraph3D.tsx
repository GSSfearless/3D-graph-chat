import { useSpring, animated } from '@react-spring/three';
import { Billboard, Text } from '@react-three/drei';
import { Edge, Node } from '../types/graph';
import { getEdgeColor } from '../utils/colors';
import * as THREE from 'three';

interface EdgeProps {
  edge: Edge;
  sourceNode: Node;
  targetNode: Node;
}

const EdgeLine: React.FC<EdgeProps> = ({ edge, sourceNode, targetNode }) => {
  if (!sourceNode?.position || !targetNode?.position || !edge?.relationship) {
    return null;
  }

  const { spring } = useSpring({
    spring: 1,
    from: { spring: 0 },
    config: { mass: 5, tension: 400, friction: 50, precision: 0.0001 }
  });

  const sourcePos = sourceNode.position;
  const targetPos = targetNode.position;

  // 计算边的中点位置，用于显示标签
  const midPoint = {
    x: (sourcePos.x + targetPos.x) / 2,
    y: (sourcePos.y + targetPos.y) / 2,
    z: (sourcePos.z + targetPos.z) / 2
  };

  return (
    <group>
      <animated.line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              sourcePos.x, sourcePos.y, sourcePos.z,
              targetPos.x, targetPos.y, targetPos.z
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          attach="material"
          color={getEdgeColor(edge.relationship.type)}
          linewidth={edge.relationship.strength || 1}
          opacity={spring.get()}
          transparent
        />
      </animated.line>
      <Billboard
        position={[midPoint.x, midPoint.y, midPoint.z]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Text
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {edge.relationship.label || '关联'}
        </Text>
      </Billboard>
    </group>
  );
}; 