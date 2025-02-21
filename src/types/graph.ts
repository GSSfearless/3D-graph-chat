import * as THREE from 'three';

export enum NodeType {
  QUESTION = 'question',
  CONCEPT = 'concept',
  EXAMPLE = 'example',
  SUMMARY = 'summary',
  DETAIL = 'detail'
}

export enum EdgeType {
  EXPLAINS = 'explains',
  EXEMPLIFIES = 'exemplifies',
  SUMMARIZES = 'summarizes',
  DETAILS = 'details',
  RELATES_TO = 'relates_to'
}

export interface Node {
  id: string;
  type: NodeType;
  content: string;
  importance: number;
  depth: number;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  color?: string;
  size?: number;
  metadata?: {
    [key: string]: any;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  relationship: {
    type: EdgeType;
    label?: string;
    strength?: number;
  };
  metadata?: {
    [key: string]: any;
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
      color: string;
      emissive: string;
      size: number;
      opacity: number;
    };
  };
  edges: {
    [key in EdgeType]: {
      color: string;
      width: number;
      opacity: number;
    };
  };
} 