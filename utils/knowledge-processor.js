import * as d3 from 'd3';
import { extractEntities, extractRelations, computeEmbeddings } from './nlp-utils';

export class KnowledgeGraphProcessor {
  constructor() {
    this.nodeTypes = {
      CONCEPT: 'concept',
      ENTITY: 'entity',
      EVENT: 'event',
      ATTRIBUTE: 'attribute',
      RELATION: 'relation'
    };

    this.layoutTypes = {
      FORCE: 'force',
      HIERARCHICAL: 'hierarchical',
      RADIAL: 'radial'
    };

    this.colorScheme = {
      concept: '#4A90E2',    // 蓝色
      entity: '#50E3C2',     // 青色
      event: '#F5A623',      // 橙色
      attribute: '#B8E986',  // 绿色
      relation: '#BD10E0'    // 紫色
    };
  }

  async processText(text) {
    try {
      if (!text || typeof text !== 'string') {
        console.warn('Invalid input text:', text);
        return { nodes: [], edges: [] };
      }

      // 1. 实体抽取
      const entities = await extractEntities(text);
      if (!Array.isArray(entities) || entities.length === 0) {
        console.warn('No valid entities extracted');
        return { nodes: [], edges: [] };
      }
      console.log('Extracted entities:', entities);
      
      // 2. 关系抽取
      const relations = await extractRelations(text);
      console.log('Extracted relations:', relations);
      
      // 3. 计算实体向量嵌入
      const embeddings = await computeEmbeddings(entities);
      
      // 4. 构建节点和边的映射
      const nodeMap = new Map();
      const nodes = [];
      const edges = [];

      // 5. 构建节点
      entities.forEach((entity, index) => {
        const node = {
          data: {
            id: entity.id,
            label: entity.text,
            text: entity.text,
            type: this.getNodeType(entity),
            size: this.calculateNodeSize(entity),
            color: this.colorScheme[this.getNodeType(entity)],
            embedding: embeddings[index],
            properties: entity.properties || {},
            cluster: entity.cluster || 0
          }
        };
        nodes.push(node);
        nodeMap.set(entity.id, node);
      });

      // 6. 构建边（只保留存在对应节点的边）
      relations.forEach(relation => {
        if (nodeMap.has(relation.source) && nodeMap.has(relation.target)) {
          const edge = {
            data: {
              id: relation.id,
              source: relation.source,
              target: relation.target,
              label: relation.label,
              type: relation.type,
              weight: relation.weight || 1,
              properties: relation.properties || {}
            }
          };
          edges.push(edge);
        } else {
          console.warn('Invalid relation - missing nodes:', relation);
        }
      });

      // 7. 应用布局
      const graphData = {
        nodes: nodes,
        edges: edges
      };

      console.log('Final graph data:', graphData);
      return graphData;
    } catch (error) {
      console.error('Error processing text:', error);
      return { nodes: [], edges: [] };
    }
  }

  getNodeType(entity) {
    if (entity.isEvent) return this.nodeTypes.EVENT;
    if (entity.isAttribute) return this.nodeTypes.ATTRIBUTE;
    if (entity.isConcept) return this.nodeTypes.CONCEPT;
    return this.nodeTypes.ENTITY;
  }

  calculateNodeSize(entity) {
    const baseSize = 10;
    const importance = entity.importance || 1;
    return baseSize * Math.sqrt(importance);
  }

  applyLayout({ nodes, edges, type }) {
    switch (type) {
      case this.layoutTypes.FORCE:
        return this.applyForceLayout(nodes, edges);
      case this.layoutTypes.HIERARCHICAL:
        return this.applyHierarchicalLayout(nodes, edges);
      case this.layoutTypes.RADIAL:
        return this.applyRadialLayout(nodes, edges);
      default:
        return this.applyForceLayout(nodes, edges);
    }
  }

  applyForceLayout(nodes, edges) {
    if (!nodes.length) return { nodes, edges };

    const simulation = d3.forceSimulation(nodes.map(node => ({
      ...node.data,
      x: node.position.x,
      y: node.position.y
    })))
      .force('link', d3.forceLink(edges.map(edge => edge.data)).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(d => d.size * 2))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    // 运行模拟
    for (let i = 0; i < 300; ++i) simulation.tick();

    // 更新节点位置
    const updatedNodes = nodes.map((node, i) => ({
      ...node,
      position: {
        x: simulation.nodes()[i].x || 0,
        y: simulation.nodes()[i].y || 0
      }
    }));

    return { nodes: updatedNodes, edges };
  }

  applyHierarchicalLayout(nodes, edges) {
    // 实现分层布局算法
    const hierarchy = d3.stratify()
      .id(d => d.id)
      .parentId(d => this.findParent(d, edges))(nodes);

    const layout = d3.tree()
      .size([800, 600]);

    const root = layout(hierarchy);

    // 转换回我们的数据格式
    return {
      nodes: nodes.map(node => ({
        ...node,
        x: root.find(d => d.id === node.id).x,
        y: root.find(d => d.id === node.id).y
      })),
      edges
    };
  }

  applyRadialLayout(nodes, edges) {
    // 实现放射状布局
    const angleStep = (2 * Math.PI) / nodes.length;
    const radius = 300;

    return {
      nodes: nodes.map((node, i) => ({
        ...node,
        x: radius * Math.cos(i * angleStep),
        y: radius * Math.sin(i * angleStep)
      })),
      edges
    };
  }

  findParent(node, edges) {
    const edge = edges.find(e => e.target === node.id);
    return edge ? edge.source : null;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // 确保哈希值为正数并且不超过一定长度
    return Math.abs(hash).toString(36).substring(0, 8);
  }
} 