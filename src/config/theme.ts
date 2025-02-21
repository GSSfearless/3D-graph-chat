import { GraphTheme, NodeType, EdgeType } from '../types/graph';

export const defaultTheme: GraphTheme = {
  nodes: {
    [NodeType.QUESTION]: {
      color: '#F43F5E',
      emissive: '#FCA5A5',
      size: 1.5,
      opacity: 0.9
    },
    [NodeType.CONCEPT]: {
      color: '#6366F1',
      emissive: '#818CF8',
      size: 1.2,
      opacity: 0.9
    },
    [NodeType.EXAMPLE]: {
      color: '#10B981',
      emissive: '#34D399',
      size: 1.0,
      opacity: 0.8
    },
    [NodeType.SUMMARY]: {
      color: '#F59E0B',
      emissive: '#FCD34D',
      size: 1.1,
      opacity: 0.85
    },
    [NodeType.DETAIL]: {
      color: '#8B5CF6',
      emissive: '#A78BFA',
      size: 0.9,
      opacity: 0.8
    }
  },
  edges: {
    [EdgeType.EXPLAINS]: {
      color: '#6366F1',
      width: 2,
      opacity: 0.6
    },
    [EdgeType.EXEMPLIFIES]: {
      color: '#10B981',
      width: 1.5,
      opacity: 0.5
    },
    [EdgeType.SUMMARIZES]: {
      color: '#F59E0B',
      width: 1.8,
      opacity: 0.55
    },
    [EdgeType.DETAILS]: {
      color: '#8B5CF6',
      width: 1.5,
      opacity: 0.5
    },
    [EdgeType.RELATES_TO]: {
      color: '#94A3B8',
      width: 1,
      opacity: 0.4
    }
  }
}; 