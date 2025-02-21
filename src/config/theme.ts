import { GraphTheme } from '../types/graph';

export const defaultTheme: GraphTheme = {
  nodes: {
    question: {
      size: 2.5,
      color: '#1a365d',
      emissive: '#3b82f6',
      opacity: 1
    },
    concept: {
      size: 1.8,
      color: '#3b82f6',
      emissive: '#60a5fa',
      opacity: 0.9
    },
    example: {
      size: 1.2,
      color: '#7c3aed',
      emissive: '#a78bfa',
      opacity: 0.8
    },
    summary: {
      size: 2,
      color: '#2563eb',
      emissive: '#93c5fd',
      opacity: 0.9
    },
    detail: {
      size: 1,
      color: '#6366f1',
      emissive: '#a5b4fc',
      opacity: 0.7
    }
  },
  edges: {
    sequence: {
      color: '#94a3b8',
      opacity: 0.8,
      width: 2
    },
    example: {
      color: '#a78bfa',
      opacity: 0.6,
      width: 1
    },
    summary: {
      color: '#60a5fa',
      opacity: 0.8,
      width: 3
    },
    detail: {
      color: '#93c5fd',
      opacity: 0.5,
      width: 1
    },
    related: {
      color: '#cbd5e1',
      opacity: 0.4,
      width: 1
    }
  }
}; 