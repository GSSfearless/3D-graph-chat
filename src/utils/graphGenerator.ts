import { KnowledgeGraph, Node, Edge, NodeType, EdgeType } from '../types/graph';
import * as THREE from 'three';

interface GenerateGraphOptions {
  question: string;
  concepts: Array<{
    content: string;
    examples?: string[];
    summaries?: string[];
    details?: string[];
  }>;
}

export const generateGraph = (options: GenerateGraphOptions): KnowledgeGraph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let idCounter = 1;

  // 创建主问题节点
  const mainQuestion: Node = {
    id: `q${idCounter++}`,
    type: NodeType.QUESTION,
    content: options.question,
    importance: 1,
    depth: 0,
    position: new THREE.Vector3(0, 0, 0)
  };

  // 为每个概念创建节点和边
  options.concepts.forEach((concept, conceptIndex) => {
    const conceptPosition = new THREE.Vector3(
      Math.cos(conceptIndex * Math.PI * 2 / options.concepts.length) * 10,
      Math.sin(conceptIndex * Math.PI * 2 / options.concepts.length) * 10,
      0
    );

    // 创建概念节点
    const conceptNode: Node = {
      id: `c${idCounter++}`,
      type: NodeType.CONCEPT,
      content: concept.content,
      importance: 0.8,
      depth: 1,
      position: conceptPosition
    };
    nodes.push(conceptNode);

    // 连接主问题和概念
    edges.push({
      id: `e${idCounter++}`,
      source: mainQuestion.id,
      target: conceptNode.id,
      relationship: {
        type: EdgeType.SEQUENCE,
        label: '包含'
      }
    });

    // 创建示例节点
    concept.examples?.forEach((example, index) => {
      const exampleNode: Node = {
        id: `ex${idCounter++}`,
        type: NodeType.EXAMPLE,
        content: example,
        importance: 0.6,
        depth: 2,
        position: new THREE.Vector3(
          conceptPosition.x + Math.cos(index * Math.PI / 2) * 5,
          conceptPosition.y + Math.sin(index * Math.PI / 2) * 5,
          5
        )
      };
      nodes.push(exampleNode);

      edges.push({
        id: `e${idCounter++}`,
        source: conceptNode.id,
        target: exampleNode.id,
        relationship: {
          type: EdgeType.EXAMPLE,
          label: '例如'
        }
      });
    });

    // 创建总结节点
    concept.summaries?.forEach((summary, index) => {
      const summaryNode: Node = {
        id: `s${idCounter++}`,
        type: NodeType.SUMMARY,
        content: summary,
        importance: 0.7,
        depth: 2,
        position: new THREE.Vector3(
          conceptPosition.x + Math.cos(index * Math.PI / 2 + Math.PI / 4) * 7,
          conceptPosition.y + Math.sin(index * Math.PI / 2 + Math.PI / 4) * 7,
          -5
        )
      };
      nodes.push(summaryNode);

      edges.push({
        id: `e${idCounter++}`,
        source: conceptNode.id,
        target: summaryNode.id,
        relationship: {
          type: EdgeType.SUMMARY,
          label: '总结'
        }
      });
    });

    // 创建详细信息节点
    concept.details?.forEach((detail, index) => {
      const detailNode: Node = {
        id: `d${idCounter++}`,
        type: NodeType.DETAIL,
        content: detail,
        importance: 0.5,
        depth: 2,
        position: new THREE.Vector3(
          conceptPosition.x + Math.cos(index * Math.PI / 2 + Math.PI / 2) * 6,
          conceptPosition.y + Math.sin(index * Math.PI / 2 + Math.PI / 2) * 6,
          0
        )
      };
      nodes.push(detailNode);

      edges.push({
        id: `e${idCounter++}`,
        source: conceptNode.id,
        target: detailNode.id,
        relationship: {
          type: EdgeType.DETAIL,
          label: '详细'
        }
      });
    });
  });

  return {
    mainQuestion,
    nodes: [mainQuestion, ...nodes],
    edges,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    }
  };
}; 