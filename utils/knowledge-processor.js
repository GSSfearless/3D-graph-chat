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
    // 1. 实体抽取
    const entities = await extractEntities(text);
    
    // 2. 关系抽取
    const relations = await extractRelations(text);
    
    // 3. 计算实体向量嵌入
    const embeddings = await computeEmbeddings(entities);
    
    // 4. 构建节点和边的映射
    const nodeMap = new Map(entities.map(entity => [entity.text, entity]));
    
    // 5. 构建节点
    const nodes = this.buildNodes(entities, embeddings);
    
    // 6. 构建边（只保留存在对应节点的边）
    const edges = this.buildEdges(relations.filter(relation => 
      nodeMap.has(relation.source) && nodeMap.has(relation.target)
    ));
    
    // 7. 应用布局
    const graphData = this.applyLayout({
      nodes,
      edges,
      type: this.layoutTypes.FORCE
    });

    return graphData;
  }

  buildNodes(entities, embeddings) {
    return entities.map((entity, index) => ({
      id: entity.id,
      label: entity.text,
      type: this.getNodeType(entity),
      size: this.calculateNodeSize(entity),
      color: this.colorScheme[this.getNodeType(entity)],
      embedding: embeddings[index],
      properties: entity.properties || {},
      cluster: entity.cluster || 0,
      x: 0,  // 初始位置
      y: 0
    }));
  }

  buildEdges(relations) {
    return relations.map((relation, index) => ({
      id: relation.id,
      source: `node-${relation.source.replace(/[^a-zA-Z0-9]/g, '_')}`,
      target: `node-${relation.target.replace(/[^a-zA-Z0-9]/g, '_')}`,
      type: relation.type,
      weight: relation.weight || 1,
      label: relation.label
    }));
  }

  getNodeType(entity) {
    // 基于实体特征判断节点类型
    if (entity.isEvent) return this.nodeTypes.EVENT;
    if (entity.isAttribute) return this.nodeTypes.ATTRIBUTE;
    if (entity.isConcept) return this.nodeTypes.CONCEPT;
    return this.nodeTypes.ENTITY;
  }

  calculateNodeSize(entity) {
    // 基于实体重要性计算节点大小
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

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(d => d.size * 2))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    // 运行模拟
    for (let i = 0; i < 300; ++i) simulation.tick();

    // 确保所有节点都有坐标
    nodes.forEach(node => {
      if (typeof node.x !== 'number') node.x = 0;
      if (typeof node.y !== 'number') node.y = 0;
    });

    return { nodes, edges };
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
} 