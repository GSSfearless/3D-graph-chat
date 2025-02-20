export class KnowledgeProcessor {
  constructor() {
    this.nodeTypes = {
      CONCEPT: 'concept',
      ENTITY: 'entity',
      EVENT: 'event',
      PROPERTY: 'property',
      RELATION: 'relation'
    };

    this.relationTypes = {
      IS_A: 'is_a',
      PART_OF: 'part_of',
      HAS_PROPERTY: 'has_property',
      RELATED_TO: 'related_to',
      CAUSES: 'causes',
      BELONGS_TO: 'belongs_to'
    };
  }

  // 处理搜索响应，生成知识图谱数据
  processSearchResponse(content) {
    const { concepts, entities, relations } = this.extractKnowledgeElements(content);
    return this.buildGraphData(concepts, entities, relations);
  }

  // 从文本中提取知识元素
  extractKnowledgeElements(text) {
    const concepts = new Set();
    const entities = new Set();
    const relations = new Map();

    // 分句处理
    const sentences = text.split(/[。！？.!?]/);
    
    sentences.forEach(sentence => {
      // 提取概念（通常是抽象的名词短语）
      const conceptMatches = sentence.match(/([一个])?([的地得])?([^，。！？,!?]{2,})/g) || [];
      conceptMatches.forEach(match => {
        if (this.isValidConcept(match)) {
          concepts.add(match.trim());
        }
      });

      // 提取实体（具体的人、物、地点等）
      const entityMatches = sentence.match(/([的])?([^，。！？,!?]{2,})/g) || [];
      entityMatches.forEach(match => {
        if (this.isValidEntity(match)) {
          entities.add(match.trim());
        }
      });

      // 提取关系
      this.extractRelations(sentence, relations);
    });

    return {
      concepts: Array.from(concepts),
      entities: Array.from(entities),
      relations: Array.from(relations.entries()).map(([key, value]) => ({
        source: value.source,
        target: value.target,
        type: value.type
      }))
    };
  }

  // 构建图数据
  buildGraphData(concepts, entities, relations) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // 判断节点类型的辅助函数
    const getNodeType = (text) => {
      // 主要步骤关键词
      const mainKeywords = ['准备', '要求', '面试', '提升', '关注'];
      // 次要步骤关键词
      const subKeywords = ['简历', '岗位', '技能', '经验', '实习'];
      // 提示信息关键词
      const tipKeywords = ['注意', '建议', '技巧', '重点', '避免'];

      if (mainKeywords.some(keyword => text.includes(keyword))) {
        return 'main';
      } else if (subKeywords.some(keyword => text.includes(keyword))) {
        return 'sub';
      } else if (tipKeywords.some(keyword => text.includes(keyword))) {
        return 'tip';
      }
      return 'detail';
    };

    // 添加概念节点
    concepts.forEach(concept => {
      const nodeId = this.generateId(concept);
      nodes.push({
        data: {
          id: nodeId,
          label: concept,
          type: getNodeType(concept),
          category: 0
        }
      });
      nodeMap.set(concept, nodeId);
    });

    // 添加实体节点
    entities.forEach(entity => {
      const nodeId = this.generateId(entity);
      nodes.push({
        data: {
          id: nodeId,
          label: entity,
          type: getNodeType(entity),
          category: 1
        }
      });
      nodeMap.set(entity, nodeId);
    });

    // 添加关系边
    relations.forEach(relation => {
      const sourceId = nodeMap.get(relation.source);
      const targetId = nodeMap.get(relation.target);
      
      if (sourceId && targetId) {
        edges.push({
          data: {
            source: sourceId,
            target: targetId,
            label: this.getRelationLabel(relation.type),
            type: relation.type
          }
        });
      }
    });

    return {
      nodes,
      edges
    };
  }

  // 验证概念有效性
  isValidConcept(text) {
    const invalidPatterns = [
      /^[的地得]/, // 开头是的地得
      /^[和与或]/, // 开头是连接词
      /^[了过着]/, // 开头是时态词
      /^\d+$/, // 纯数字
      /^[一二三四五六七八九十百千万亿]+$/ // 中文数字
    ];

    return text.length >= 2 && 
           !invalidPatterns.some(pattern => pattern.test(text)) &&
           !/^[a-zA-Z0-9_]+$/.test(text); // 不是纯英文或数字
  }

  // 验证实体有效性
  isValidEntity(text) {
    return text.length >= 2 && 
           !/^[的地得]/.test(text) && // 不以的地得开头
           !/^[和与或]/.test(text) && // 不以连接词开头
           !/^\d+$/.test(text); // 不是纯数字
  }

  // 提取关系
  extractRelations(sentence, relations) {
    // 是...的关系
    const isPattern = /(.+)是(.+)的?/;
    // 包含...的关系
    const containsPattern = /(.+)包含(.+)的?/;
    // 属于...的关系
    const belongsPattern = /(.+)属于(.+)的?/;
    // 导致...的关系
    const causesPattern = /(.+)导致(.+)的?/;

    const patterns = [
      { regex: isPattern, type: this.relationTypes.IS_A },
      { regex: containsPattern, type: this.relationTypes.PART_OF },
      { regex: belongsPattern, type: this.relationTypes.BELONGS_TO },
      { regex: causesPattern, type: this.relationTypes.CAUSES }
    ];

    patterns.forEach(pattern => {
      const match = sentence.match(pattern.regex);
      if (match) {
        const [, source, target] = match;
        if (source && target) {
          const relationKey = `${source}-${target}`;
          relations.set(relationKey, {
            source: source.trim(),
            target: target.trim(),
            type: pattern.type
          });
        }
      }
    });
  }

  // 获取关系标签
  getRelationLabel(type) {
    const labels = {
      [this.relationTypes.IS_A]: '是',
      [this.relationTypes.PART_OF]: '包含',
      [this.relationTypes.HAS_PROPERTY]: '具有',
      [this.relationTypes.RELATED_TO]: '相关',
      [this.relationTypes.CAUSES]: '导致',
      [this.relationTypes.BELONGS_TO]: '属于'
    };
    return labels[type] || '关联';
  }

  // 生成唯一ID
  generateId(text) {
    return `node-${text.replace(/[^a-zA-Z0-9]/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 计算节点重要性
  calculateNodeImportance(nodes, edges) {
    const degrees = new Map();
    
    // 计算度数
    edges.forEach(edge => {
      degrees.set(edge.data.source, (degrees.get(edge.data.source) || 0) + 1);
      degrees.set(edge.data.target, (degrees.get(edge.data.target) || 0) + 1);
    });

    // 更新节点大小
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        size: Math.max(30, Math.min(80, (degrees.get(node.data.id) || 0) * 10))
      }
    }));
  }

  // 聚类分析
  performClustering(nodes, edges) {
    // 实现社区发现算法
    // 这里使用简单的度数聚类作为示例
    const clusters = new Map();
    
    nodes.forEach(node => {
      const degree = edges.filter(e => 
        e.data.source === node.data.id || e.data.target === node.data.id
      ).length;

      const clusterIndex = Math.floor(degree / 5); // 每5个度数为一个簇
      if (!clusters.has(clusterIndex)) {
        clusters.set(clusterIndex, []);
      }
      clusters.get(clusterIndex).push(node);
    });

    return clusters;
  }

  // 路径分析
  findShortestPath(nodes, edges, startId, endId) {
    const graph = new Map();
    
    // 构建邻接表
    edges.forEach(edge => {
      if (!graph.has(edge.data.source)) {
        graph.set(edge.data.source, []);
      }
      if (!graph.has(edge.data.target)) {
        graph.set(edge.data.target, []);
      }
      graph.get(edge.data.source).push(edge.data.target);
      graph.get(edge.data.target).push(edge.data.source);
    });

    // BFS查找最短路径
    const queue = [[startId]];
    const visited = new Set();

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === endId) {
        return path;
      }

      if (!visited.has(node)) {
        visited.add(node);
        const neighbors = graph.get(node) || [];
        
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push([...path, neighbor]);
          }
        }
      }
    }

    return null; // 没有找到路径
  }
} 