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
      if (!Array.isArray(entities)) {
        console.warn('Invalid entities result:', entities);
        return { nodes: [], edges: [] };
      }
      
      // 2. 关系抽取
      const relations = await extractRelations(text);
      console.log('Extracted relations before filtering:', relations);
      if (!Array.isArray(relations)) {
        console.warn('Invalid relations result:', relations);
        return { nodes: [], edges: [] };
      }
      
      // 3. 计算实体向量嵌入
      const embeddings = await computeEmbeddings(entities);
      
      // 4. 构建节点和边的映射
      const nodeMap = new Map();
      entities.forEach(entity => {
        const nodeId = `node-${entity.text.replace(/[^a-zA-Z0-9]/g, '_')}`;
        nodeMap.set(nodeId, { ...entity, id: nodeId });
        // 同时用文本作为键存储
        nodeMap.set(entity.text, { ...entity, id: nodeId });
      });

      console.log('Node map:', Array.from(nodeMap.entries()));
      
      // 5. 构建节点
      const nodes = this.buildNodes(entities, embeddings);
      if (!nodes.length) {
        console.warn('No valid nodes generated');
        return { nodes: [], edges: [] };
      }
      
      // 6. 构建边（只保留存在对应节点的边）
      const validRelations = relations.filter(relation => {
        console.log('Checking relation:', relation);
        // 检查源节点和目标节点是否存在
        const hasSource = nodeMap.has(relation.source);
        const hasTarget = nodeMap.has(relation.target);
        
        if (!hasSource) {
          console.warn('Source node not found:', relation.source);
        }
        if (!hasTarget) {
          console.warn('Target node not found:', relation.target);
        }
        
        return hasSource && hasTarget;
      });

      console.log('Valid relations after filtering:', validRelations);
      
      const edges = this.buildEdges(validRelations);
      console.log('Built edges:', edges);
      
      // 7. 应用布局
      const graphData = this.applyLayout({
        nodes,
        edges,
        type: this.layoutTypes.FORCE
      });

      // 8. 验证最终数据
      if (!graphData.nodes || !graphData.edges) {
        console.warn('Invalid graph data generated:', graphData);
        return { nodes: [], edges: [] };
      }

      console.log('Final graph data:', graphData);
      return graphData;
    } catch (error) {
      console.error('Error processing text:', error);
      return { nodes: [], edges: [] };
    }
  }

  buildNodes(entities, embeddings) {
    return entities.map((entity, index) => {
      // 确保 entity.text 存在，如果不存在则使用一个默认值
      const label = entity.text || entity.label || `Entity ${index + 1}`;
      const nodeId = entity.id || `node-${this.hashString(label)}`;
      
      return {
        data: {
          id: nodeId,
          label: label,
          text: entity.text || label,
          type: this.getNodeType(entity),
          size: this.calculateNodeSize(entity),
          color: this.colorScheme[this.getNodeType(entity)],
          embedding: embeddings[index],
          properties: entity.properties || {},
          cluster: entity.cluster || 0
        },
        position: { x: 0, y: 0 }
      };
    }).filter(node => 
      node && 
      node.data &&
      typeof node.data.id === 'string' && 
      typeof node.data.label === 'string' && 
      node.data.label.length > 0
    );
  }

  buildEdges(relations) {
    // 添加调试日志
    console.log('Building edges from relations:', relations);

    return relations
      .filter(relation => {
        // 验证关系对象的有效性
        const isValid = relation && 
          typeof relation.source === 'string' && 
          typeof relation.target === 'string' &&
          relation.source !== relation.target; // 过滤掉自环

        if (!isValid) {
          console.warn('Invalid relation:', relation);
        }

        return isValid;
      })
      .map((relation, index) => {
        // 确保边的属性都存在
        const edge = {
          data: {
            id: relation.id || `edge-${index}`,
            source: relation.source,
            target: relation.target,
            type: relation.type || 'default',
            label: relation.label || '关联',
            weight: relation.weight || 1,
            properties: relation.properties || {}
          }
        };

        // 添加调试日志
        console.log('Created edge:', edge);
        return edge;
      });
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