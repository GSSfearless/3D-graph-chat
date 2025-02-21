import { useSpring, animated } from '@react-spring/three';
import { Billboard, Text } from '@react-three/drei';
import { Edge, Node, EdgeType } from '../types/graph';
import { getEdgeColor } from '../utils/colors';
import * as THREE from 'three';

interface EdgeProps {
  edge: Edge;
  sourceNode: Node;
  targetNode: Node;
}

const defaultRelationship = {
  type: EdgeType.EXPLAINS,
  label: '关联',
  strength: 1
};

const EdgeLine: React.FC<EdgeProps> = ({ edge, sourceNode, targetNode }) => {
  // 首先检查所有必需的属性
  if (!edge || !sourceNode || !targetNode) {
    console.warn('Missing required props in EdgeLine');
    return null;
  }

  // 确保position属性存在
  if (!sourceNode.position || !targetNode.position) {
    console.warn('Missing position data in nodes');
    return null;
  }

  // 使用默认关系数据如果relationship未定义
  const relationship = edge.relationship || defaultRelationship;

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
          color={getEdgeColor(relationship.type)}
          linewidth={relationship.strength || 1}
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
          {relationship.label || '关联'}
        </Text>
      </Billboard>
    </group>
  );
}; 