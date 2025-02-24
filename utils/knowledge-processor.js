import * as d3 from 'd3';
import { extractEntities, extractRelations, computeEmbeddings } from './nlp-utils';

// 添加ID规范化函数
const normalizeId = (id) => {
  if (!id) return '';
  const stringId = String(id).trim();
  // 移除已存在的 'node-' 前缀，避免重复添加
  const baseId = stringId.startsWith('node-') ? stringId.slice(5) : stringId;
  // 统一处理特殊字符
  return `node-${baseId.replace(/[^a-zA-Z0-9]/g, '_')}`;
};

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
      console.log('提取的关系数据:', relations);
      if (!Array.isArray(relations)) {
        console.warn('Invalid relations result:', relations);
        return { nodes: [], edges: [] };
      }
      
      // 3. 计算实体向量嵌入
      const embeddings = await computeEmbeddings(entities);
      
      // 4. 构建节点和边的映射
      const nodeMap = new Map();
      entities.forEach(entity => {
        const nodeId = normalizeId(entity.text);
        const nodeData = { ...entity, id: nodeId };
        nodeMap.set(nodeId, nodeData);
        // 同时用文本作为键存储
        nodeMap.set(entity.text, nodeData);
        console.log('创建节点映射:', {
          文本: entity.text,
          ID: nodeId
        });
      });

      // 5. 构建节点
      const nodes = this.buildNodes(entities, embeddings);
      if (!nodes.length) {
        console.warn('No valid nodes generated');
        return { nodes: [], edges: [] };
      }
      
      // 6. 构建边（只保留存在对应节点的边）
      const validRelations = relations.filter(relation => {
        const sourceId = normalizeId(relation.source);
        const targetId = normalizeId(relation.target);
        
        const hasSource = nodeMap.has(sourceId) || nodeMap.has(relation.source);
        const hasTarget = nodeMap.has(targetId) || nodeMap.has(relation.target);
        
        if (!hasSource) {
          console.warn('找不到源节点:', {
            原始ID: relation.source,
            规范化ID: sourceId,
            可用节点: Array.from(nodeMap.keys())
          });
        }
        if (!hasTarget) {
          console.warn('找不到目标节点:', {
            原始ID: relation.target,
            规范化ID: targetId,
            可用节点: Array.from(nodeMap.keys())
          });
        }
        
        return hasSource && hasTarget;
      });

      console.log('有效的关系数据:', validRelations);
      
      const edges = this.buildEdges(validRelations);
      console.log('构建的边:', edges);
      
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

      console.log('最终图数据:', {
        节点数量: graphData.nodes.length,
        边数量: graphData.edges.length
      });
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
      const nodeId = normalizeId(label);
      
      const node = {
        id: nodeId,
        label: label,
        text: entity.text || label,
        type: this.getNodeType(entity),
        size: 1, // 使用默认大小，实际大小将由KnowledgeGraph组件计算
        color: this.colorScheme[this.getNodeType(entity)],
        embedding: embeddings[index],
        properties: entity.properties || {},
        cluster: entity.cluster || 0,
        x: 0,
        y: 0
      };

      console.log('构建节点:', {
        标签: label,
        ID: nodeId
      });

      return node;
    }).filter(node => 
      node && 
      typeof node.id === 'string' && 
      typeof node.label === 'string' && 
      node.label.length > 0
    );
  }

  buildEdges(relations) {
    return relations
      .filter(relation => relation && typeof relation.source === 'string' && typeof relation.target === 'string')
      .map((relation, index) => {
        const sourceId = normalizeId(relation.source);
        const targetId = normalizeId(relation.target);
        
        const edge = {
          id: relation.id || `edge-${index}`,
          source: sourceId,
          target: targetId,
          type: relation.type || 'default',
          label: relation.label || '关联',
          weight: relation.weight || 1,
          properties: relation.properties || {}
        };

        console.log('构建边:', {
          ID: edge.id,
          源节点: sourceId,
          目标节点: targetId
        });

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