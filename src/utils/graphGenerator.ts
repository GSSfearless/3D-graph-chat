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
    position: {
      x: 0,
      y: 0,
      z: 0
    }
  };

  // 为每个概念创建节点和边
  options.concepts.forEach((concept, conceptIndex) => {
    const angle = (conceptIndex * Math.PI * 2) / options.concepts.length;
    const radius = 10;
    const conceptPosition = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: 0
    };

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
        type: EdgeType.EXPLAINS,
        label: '解释',
        strength: 0.8
      }
    });

    // 创建示例节点
    concept.examples?.forEach((example, index) => {
      const exampleAngle = angle + (index * Math.PI / 4) - (Math.PI / 8);
      const exampleNode: Node = {
        id: `ex${idCounter++}`,
        type: NodeType.EXAMPLE,
        content: example,
        importance: 0.6,
        depth: 2,
        position: {
          x: conceptPosition.x + Math.cos(exampleAngle) * 5,
          y: conceptPosition.y + Math.sin(exampleAngle) * 5,
          z: 5
        }
      };
      nodes.push(exampleNode);

      edges.push({
        id: `e${idCounter++}`,
        source: conceptNode.id,
        target: exampleNode.id,
        relationship: {
          type: EdgeType.EXEMPLIFIES,
          label: '例如',
          strength: 0.6
        }
      });
    });

    // 创建总结节点
    concept.summaries?.forEach((summary, index) => {
      const summaryAngle = angle + (index * Math.PI / 4) + (Math.PI / 8);
      const summaryNode: Node = {
        id: `s${idCounter++}`,
        type: NodeType.SUMMARY,
        content: summary,
        importance: 0.7,
        depth: 2,
        position: {
          x: conceptPosition.x + Math.cos(summaryAngle) * 7,
          y: conceptPosition.y + Math.sin(summaryAngle) * 7,
          z: -5
        }
      };
      nodes.push(summaryNode);

      edges.push({
        id: `e${idCounter++}`,
        source: conceptNode.id,
        target: summaryNode.id,
        relationship: {
          type: EdgeType.SUMMARIZES,
          label: '总结',
          strength: 0.7
        }
      });
    });

    // 创建详细信息节点
    concept.details?.forEach((detail, index) => {
      const detailAngle = angle + (index * Math.PI / 4);
      const detailNode: Node = {
        id: `d${idCounter++}`,
        type: NodeType.DETAIL,
        content: detail,
        importance: 0.5,
        depth: 2,
        position: {
          x: conceptPosition.x + Math.cos(detailAngle) * 6,
          y: conceptPosition.y + Math.sin(detailAngle) * 6,
          z: 0
        }
      };
      nodes.push(detailNode);

      edges.push({
        id: `e${idCounter++}`,
        source: conceptNode.id,
        target: detailNode.id,
        relationship: {
          type: EdgeType.DETAILS,
          label: '详述',
          strength: 0.5
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