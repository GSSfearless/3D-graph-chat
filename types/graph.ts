import * as THREE from 'three';

export enum NodeType {
  QUESTION = 'QUESTION',
  CONCEPT = 'CONCEPT',
  EXAMPLE = 'EXAMPLE',
  SUMMARY = 'SUMMARY',
  DETAIL = 'DETAIL'
}

export enum EdgeType {
  EXPLAINS = 'EXPLAINS',
  EXEMPLIFIES = 'EXEMPLIFIES',
  SUMMARIZES = 'SUMMARIZES',
  DETAILS = 'DETAILS'
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Relationship {
  type: EdgeType;
  label: string;
  strength?: number;
}

export interface Node {
  id: string;
  type: NodeType;
  content: string;
  importance: number;
  depth: number;
  position: Position;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  relationship: Relationship;
}

export interface KnowledgeGraph {
  mainQuestion: Node;
  nodes: Node[];
  edges: Edge[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
} 