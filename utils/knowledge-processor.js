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

    this.failedMatchCount = 0;
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
      if (!Array.isArray(relations)) {
        console.warn('Invalid relations result:', relations);
        return { nodes: [], edges: [] };
      }

      // 打印原始数据以便调试
      console.log('原始数据:', {
        实体数量: entities.length,
        关系数量: relations.length,
        实体示例: entities.slice(0, 2),
        关系示例: relations.slice(0, 2)
      });
      
      // 3. 计算实体向量嵌入
      const embeddings = await computeEmbeddings(entities);
      
      // 4. 构建节点和边的映射
      const nodeMap = new Map();
      entities.forEach(entity => {
        if (!entity || typeof entity !== 'object') {
          console.warn('无效的实体数据:', entity);
          return;
        }

        const text = entity.text || entity.label;
        if (!text) {
          console.warn('实体缺少文本或标签:', entity);
          return;
        }

        const nodeId = normalizeId(text);
        const nodeData = { ...entity, id: nodeId };
        nodeMap.set(nodeId, nodeData);
        nodeMap.set(text, nodeData);
        
        console.log('创建节点映射:', {
          文本: text,
          规范化ID: nodeId,
          原始数据: JSON.stringify(entity)
        });
      });

      // 5. 构建节点
      const nodes = this.buildNodes(entities, embeddings);
      if (!nodes.length) {
        console.warn('No valid nodes generated');
        return { nodes: [], edges: [] };
      }

      // 记录所有可用的节点ID
      const availableNodeIds = new Set(nodes.map(node => node.id));
      console.log('可用的节点ID:', Array.from(availableNodeIds));
      
      // 6. 构建边（只保留存在对应节点的边）
      const validRelations = relations.filter(relation => {
        if (!relation || typeof relation !== 'object') {
          console.warn('无效的关系数据:', JSON.stringify(relation));
          return false;
        }

        // 检查源节点和目标节点的完整性
        if (!relation.source?.id || !relation.target?.id) {
          console.warn('关系缺少源节点或目标节点ID:', JSON.stringify(relation));
          return false;
        }

        const sourceId = relation.source.id;
        const targetId = relation.target.id;
        
        // 确保ID是字符串类型
        const normalizedSourceId = String(sourceId).trim();
        const normalizedTargetId = String(targetId).trim();
        
        const hasSource = availableNodeIds.has(normalizedSourceId);
        const hasTarget = availableNodeIds.has(normalizedTargetId);
        
        // 只在开发模式下输出详细的匹配失败信息
        if ((!hasSource || !hasTarget) && process.env.NODE_ENV === 'development') {
          // 统计匹配失败的次数，只在累计到一定数量时输出一次汇总
          if (!this.failedMatchCount) {
            this.failedMatchCount = 0;
          }
          this.failedMatchCount++;
          
          // 每10次失败才输出一次汇总信息
          if (this.failedMatchCount % 10 === 0) {
            console.warn(`节点匹配失败累计 ${this.failedMatchCount} 次，最近一次失败信息:`, {
              源节点: {
                ID: normalizedSourceId,
                文本: relation.source.text || '未知',
                是否存在: hasSource
              },
              目标节点: {
                ID: normalizedTargetId,
                文本: relation.target.text || '未知',
                是否存在: hasTarget
              }
            });
          }
        }
        
        return hasSource && hasTarget;
      });

      // 在处理完所有关系后，输出一次总结
      if (this.failedMatchCount > 0) {
        console.log(`关系处理完成，共有 ${this.failedMatchCount} 个关系因节点不存在而被过滤。这是正常现象，不影响主要功能。`);
        // 重置计数器
        this.failedMatchCount = 0;
      }

      console.log('有效的关系数据:', {
        总数: validRelations.length,
        示例: validRelations.slice(0, 2)
      });
      
      const edges = this.buildEdges(validRelations);
      console.log('构建的边:', {
        总数: edges.length,
        示例: edges.slice(0, 2)
      });
      
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
        边数量: graphData.edges.length,
        节点示例: graphData.nodes.slice(0, 2),
        边示例: graphData.edges.slice(0, 2)
      });
      
      return graphData;
    } catch (error) {
      console.error('Error processing text:', error);
      return { nodes: [], edges: [] };
    }
  }

  buildNodes(entities, embeddings) {
    return entities
      .filter(entity => {
        if (!entity || typeof entity !== 'object') {
          console.warn('跳过无效实体:', JSON.stringify(entity));
          return false;
        }
        return true;
      })
      .map((entity, index) => {
        const text = entity.text || entity.label;
        if (!text) {
          console.warn('实体缺少文本或标签:', JSON.stringify(entity));
          return null;
        }

        // 确保ID是规范化的
        const originalId = entity.id || '';
        const nodeId = normalizeId(text);

        // 如果原始ID和规范化ID不匹配，记录警告
        if (originalId && originalId !== nodeId) {
          console.warn('实体ID不一致:', {
            原始ID: originalId,
            规范化ID: nodeId,
            文本: text
          });
        }

        const node = {
          id: nodeId,
          label: text,
          text: text,
          type: this.getNodeType(entity),
          size: 1,
          color: this.colorScheme[this.getNodeType(entity)],
          embedding: embeddings[index],
          properties: {
            ...entity.properties,
            originalId: originalId // 保存原始ID以便追踪
          },
          cluster: entity.cluster || 0,
          x: 0,
          y: 0
        };

        console.log('构建节点:', JSON.stringify({
          ID: nodeId,
          标签: text,
          类型: node.type,
          原始ID: originalId
        }, null, 2));

        return node;
      })
      .filter(node => node !== null);
  }

  buildEdges(relations) {
    return relations
      .filter(relation => {
        if (!relation || typeof relation !== 'object') {
          console.warn('跳过无效关系:', relation);
          return false;
        }
        
        if (!relation.source || !relation.target) {
          console.warn('关系缺少源节点或目标节点:', relation);
          return false;
        }
        
        return true;
      })
      .map((relation, index) => {
        const sourceId = relation.source.id;
        const targetId = relation.target.id;
        
        const edge = {
          id: relation.id || `edge-${index}`,
          source: sourceId,
          target: targetId,
          type: relation.type || 'default',
          label: relation.label || '关联',
          weight: relation.weight || 1,
          properties: {
            ...relation.properties,
            sourceText: relation.source.text,
            targetText: relation.target.text
          }
        };

        console.log('构建边:', {
          ID: edge.id,
          源节点: {
            ID: sourceId,
            文本: relation.source.text
          },
          目标节点: {
            ID: targetId,
            文本: relation.target.text
          }
        });

        return edge;
      })
      .filter(edge => 
        edge && 
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