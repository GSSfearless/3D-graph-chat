import * as THREE from 'three';

export enum NodeType {
  QUESTION = 'question',
  CONCEPT = 'concept',
  EXAMPLE = 'example',
  SUMMARY = 'summary',
  DETAIL = 'detail'
}

export enum EdgeType {
  SEQUENCE = 'sequence',
  EXAMPLE = 'example',
  SUMMARY = 'summary',
  DETAIL = 'detail',
  RELATED = 'related'
}

export interface Node {
  id: string;
  type: NodeType;
  content: string;
  importance: number;
  depth: number;
  position?: THREE.Vector3;
  color?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  relationship: {
    type: EdgeType;
    label?: string;
  };
}

export interface KnowledgeGraph {
  mainQuestion: Node;
  nodes: Node[];
  edges: Edge[];
  metadata?: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

export interface GraphTheme {
  nodes: {
    [key in NodeType]: {
      size: number;
      color: string;
      emissive: string;
      opacity: number;
    };
  };
  edges: {
    [key in EdgeType]: {
      color: string;
      opacity: number;
      width: number;
    };
  };
} 