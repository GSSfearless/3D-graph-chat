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
      const nodeId = `node-${label.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      return {
        id: nodeId,
        label: label,
        text: entity.text || label,
        type: this.getNodeType(entity),
        size: this.calculateNodeSize(entity),
        color: this.colorScheme[this.getNodeType(entity)],
        embedding: embeddings[index],
        properties: entity.properties || {},
        cluster: entity.cluster || 0,
        x: 0,
        y: 0
      };
    }).filter(node => 
      node && 
      typeof node.id === 'string' && 
      typeof node.label === 'string' && 
      node.label.length > 0
    );
  }

  buildEdges(relations) {
    // 添加调试日志
    console.log('Building edges from relations:', relations);

    return relations
      .filter(relation => relation && typeof relation.source === 'string' && typeof relation.target === 'string')
      .map((relation, index) => {
        // 确保边的属性都存在
        const edge = {
          id: relation.id || `edge-${index}`,
          source: relation.source,
          target: relation.target,
          type: relation.type || 'default',
          label: relation.label || '关联',
          weight: relation.weight || 1,
          properties: relation.properties || {}
        };

        // 添加调试日志
        console.log('Created edge:', edge);
        return edge;
      })
      .filter(edge => 
        edge && 
        typeof edge.source === 'string' && 
        typeof edge.target === 'string' &&
        edge.source !== edge.target // 过滤掉自环
      );
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
      // 增加连接力的距离，根据边的权重调整
      .force('link', d3.forceLink(edges)
        .id(d => d.id)
        .distance(d => 100 + (1 / (d.weight || 1)) * 50)
      )
      // 增加斥力强度，避免节点过度聚集
      .force('charge', d3.forceManyBody()
        .strength(d => -300 - d.size * 10)
        .distanceMax(300)
      )
      .force('center', d3.forceCenter(0, 0))
      // 增加碰撞检测的半径
      .force('collision', d3.forceCollide().radius(d => d.size * 2.5))
      // 添加x和y方向的力以保持布局的平衡
      .force('x', d3.forceX().strength(0.1))
      .force('y', d3.forceY().strength(0.1));

    // 增加模拟次数以获得更稳定的布局
    for (let i = 0; i < 500; ++i) simulation.tick();

    // 确保所有节点都有坐标，并添加一些随机偏移以避免完全重叠
    nodes.forEach(node => {
      if (typeof node.x !== 'number') node.x = Math.random() * 100 - 50;
      if (typeof node.y !== 'number') node.y = Math.random() * 100 - 50;
    });

    // 计算布局边界
    const xExtent = d3.extent(nodes, d => d.x);
    const yExtent = d3.extent(nodes, d => d.y);
    const xScale = d3.scaleLinear().domain(xExtent).range([-400, 400]);
    const yScale = d3.scaleLinear().domain(yExtent).range([-300, 300]);

    // 应用缩放以确保图形在视图中居中
    nodes.forEach(node => {
      node.x = xScale(node.x);
      node.y = yScale(node.y);
    });

    return { 
      nodes,
      // 为边添加额外的属性以支持更丰富的视觉效果
      edges: edges.map(edge => ({
        ...edge,
        // 为不同类型的关系设置不同的颜色
        color: this.getEdgeColor(edge.type),
        // 设置边的粗细
        width: Math.max(1, Math.min(5, edge.weight || 1)),
        // 添加曲线控制点
        curve: this.calculateEdgeCurve(edge, nodes)
      }))
    };
  }

  // 添加获取边颜色的方法
  getEdgeColor(type) {
    const edgeColors = {
      'is-a': '#4A90E2',      // 蓝色
      'contains': '#50E3C2',  // 青色
      'uses': '#F5A623',      // 橙色
      'related': '#B8E986',   // 绿色
      'default': '#94A3B8'    // 灰色
    };
    return edgeColors[type] || edgeColors.default;
  }

  // 添加计算边曲线的方法
  calculateEdgeCurve(edge, nodes) {
    const source = nodes.find(n => n.id === edge.source);
    const target = nodes.find(n => n.id === edge.target);
    if (!source || !target) return null;

    // 计算边的中点
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;

    // 计算垂直于边的方向
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // 根据边的ID生成一致的偏移
    const edgeId = edge.id || `${edge.source}-${edge.target}`;
    const hashCode = [...edgeId].reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const offset = (hashCode % 2 === 0 ? 1 : -1) * Math.min(30, length * 0.2);

    // 计算控制点
    const controlX = midX - dy / length * offset;
    const controlY = midY + dx / length * offset;

    return {
      x1: source.x,
      y1: source.y,
      x2: target.x,
      y2: target.y,
      cpx: controlX,
      cpy: controlY
    };
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