import { v4 as uuidv4 } from 'uuid';

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

    this.entityMap = new Map(); // 用于去重实体
    this.relationMap = new Map(); // 用于存储关系
  }

  // 处理搜索响应，生成知识图谱数据
  processSearchResponse(content) {
    // 重置状态
    this.entityMap.clear();
    this.relationMap.clear();

    // 1. 分段处理
    const paragraphs = content.split('\n\n').filter(p => p.trim());

    // 2. 实体识别和关系抽取
    paragraphs.forEach(paragraph => {
      const { entities, relations } = this.extractKnowledge(paragraph);
      
      // 3. 实体去重和合并
      entities.forEach(entity => {
        const key = this.normalizeEntity(entity.text);
        if (!this.entityMap.has(key)) {
          this.entityMap.set(key, {
            id: uuidv4(),
            text: entity.text,
            type: entity.type,
            weight: 1,
            properties: entity.properties || {}
          });
        } else {
          const existing = this.entityMap.get(key);
          existing.weight += 1;
          // 合并属性
          Object.assign(existing.properties, entity.properties);
        }
      });

      // 4. 关系处理
      relations.forEach(relation => {
        const key = `${relation.source}:${relation.target}:${relation.type}`;
        if (!this.relationMap.has(key)) {
          this.relationMap.set(key, {
            id: uuidv4(),
            source: this.getEntityId(relation.source),
            target: this.getEntityId(relation.target),
            type: relation.type,
            weight: 1,
            properties: relation.properties || {}
          });
        } else {
          const existing = this.relationMap.get(key);
          existing.weight += 1;
        }
      });
    });

    // 5. 构建图谱数据
    return this.buildGraphData();
  }

  // 从文本中提取知识元素
  extractKnowledge(text) {
    // 使用规则和启发式方法进行知识抽取
    const entities = [];
    const relations = [];

    // 1. 抽取实体
    // 使用正则表达式匹配可能的实体
    const entityPatterns = [
      { pattern: /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, type: 'Concept' },
      { pattern: /\b(\d+(?:\.\d+)?)\s*([A-Za-z]+)\b/g, type: 'Measurement' },
      { pattern: /"([^"]+)"/g, type: 'Term' }
    ];

    entityPatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          text: match[1],
          type,
          position: match.index
        });
      }
    });

    // 2. 抽取关系
    // 使用依存句法模式匹配关系
    const relationPatterns = [
      { pattern: /(\w+)\s+(is|are|was|were)\s+(\w+)/g, type: 'is-a' },
      { pattern: /(\w+)\s+has\s+(\w+)/g, type: 'has' },
      { pattern: /(\w+)\s+contains\s+(\w+)/g, type: 'contains' },
      { pattern: /(\w+)\s+depends\s+on\s+(\w+)/g, type: 'depends-on' }
    ];

    relationPatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        relations.push({
          source: match[1],
          target: match[3] || match[2],
          type
        });
      }
    });

    return { entities, relations };
  }

  normalizeEntity(text) {
    // 标准化实体文本以便去重
    return text.toLowerCase().trim();
  }

  getEntityId(text) {
    // 获取实体ID，如果不存在则创建新实体
    const key = this.normalizeEntity(text);
    if (!this.entityMap.has(key)) {
      this.entityMap.set(key, {
        id: uuidv4(),
        text,
        type: 'Unknown',
        weight: 1
      });
    }
    return this.entityMap.get(key).id;
  }

  // 构建图数据
  buildGraphData() {
    // 构建图谱数据结构
    const nodes = Array.from(this.entityMap.values()).map(entity => ({
      data: {
        id: entity.id,
        label: entity.text,
        type: entity.type,
        weight: entity.weight,
        properties: entity.properties
      }
    }));

    const edges = Array.from(this.relationMap.values()).map(relation => ({
      data: {
        id: relation.id,
        source: relation.source,
        target: relation.target,
        label: relation.type,
        weight: relation.weight,
        properties: relation.properties
      }
    }));

    // 使用力导向布局算法计算初始位置
    const positions = this.calculateLayout(nodes, edges);
    nodes.forEach((node, index) => {
      Object.assign(node.data, positions[index]);
    });

    return { nodes, edges };
  }

  calculateLayout(nodes, edges) {
    // 实现三维力导向布局算法
    const positions = [];
    const repulsionForce = 100;
    const attractionForce = 10;
    const iterations = 100;

    // 1. 初始化随机位置
    nodes.forEach(() => {
      positions.push({
        x: Math.random() * 1000 - 500,
        y: Math.random() * 1000 - 500,
        z: Math.random() * 1000 - 500
      });
    });

    // 2. 迭代优化位置
    for (let i = 0; i < iterations; i++) {
      // 计算节点间斥力
      for (let j = 0; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          const dx = positions[k].x - positions[j].x;
          const dy = positions[k].y - positions[j].y;
          const dz = positions[k].z - positions[j].z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance > 0) {
            const force = repulsionForce / (distance * distance);
            const fx = dx * force / distance;
            const fy = dy * force / distance;
            const fz = dz * force / distance;

            positions[k].x += fx;
            positions[k].y += fy;
            positions[k].z += fz;
            positions[j].x -= fx;
            positions[j].y -= fy;
            positions[j].z -= fz;
          }
        }
      }

      // 计算边的引力
      edges.forEach(edge => {
        const sourceIndex = nodes.findIndex(n => n.data.id === edge.data.source);
        const targetIndex = nodes.findIndex(n => n.data.id === edge.data.target);
        
        if (sourceIndex >= 0 && targetIndex >= 0) {
          const dx = positions[targetIndex].x - positions[sourceIndex].x;
          const dy = positions[targetIndex].y - positions[sourceIndex].y;
          const dz = positions[targetIndex].z - positions[sourceIndex].z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance > 0) {
            const force = distance * attractionForce / 1000;
            const fx = dx * force / distance;
            const fy = dy * force / distance;
            const fz = dz * force / distance;

            positions[sourceIndex].x += fx;
            positions[sourceIndex].y += fy;
            positions[sourceIndex].z += fz;
            positions[targetIndex].x -= fx;
            positions[targetIndex].y -= fy;
            positions[targetIndex].z -= fz;
          }
        }
      });
    }

    return positions;
  }

  // 验证概念有效性
  isValidConcept(text) {
    const invalidPatterns = [
      /^[的地得]/, // 开头是的地得
      /^[和与或而且但是然后因此所以总之以下等等]/, // 开头是连接词
      /^[了过着]/, // 开头是时态词
      /^\d+$/, // 纯数字
      /^[一二三四五六七八九十百千万亿]+$/, // 中文数字
      /^[1-9]\.?$/, // 序号（如1. 2.）
      /^[①②③④⑤⑥⑦⑧⑨⑩]/, // 圆圈数字
      /^[,.，。、；：！？]/, // 标点符号
      /^[的地得之].*[的地得之]$/, // 前后都是助词
      /^(这|那|此|该|这些|那些|这样|那样)/, // 指示代词
      /^(就是|也是|还是|即是|乃是)/, // 判断词
      /^(有|没有|不是|不能|不可以)/, // 否定词
      /^(在|于|对于|关于)/, // 介词
      /[，。、；：！？]+/ // 包含标点符号
    ];

    const minLength = 2; // 最小长度
    const maxLength = 20; // 最大长度

    return text.length >= minLength && 
           text.length <= maxLength && 
           !invalidPatterns.some(pattern => pattern.test(text)) &&
           !/^[a-zA-Z0-9_]+$/.test(text); // 不是纯英文或数字
  }

  // 验证实体有效性
  isValidEntity(text) {
    const invalidPatterns = [
      /^[的地得]/, // 不以的地得开头
      /^[和与或而且但是然后因此所以总之以下等等]/, // 不以连接词开头
      /^\d+$/, // 不是纯数字
      /^[一二三四五六七八九十百千万亿]+$/, // 不是纯中文数字
      /^[1-9]\.?$/, // 不是序号
      /^[①②③④⑤⑥⑦⑧⑨⑩]/, // 不是圆圈数字
      /^[,.，。、；：！？]/, // 不是标点符号
      /^(这|那|此|该|这些|那些|这样|那样)/, // 不是指示代词
      /^(就是|也是|还是|即是|乃是)/, // 不是判断词
      /[，。、；：！？]+/ // 不包含标点符号
    ];

    const minLength = 2; // 最小长度
    const maxLength = 20; // 最大长度

    return text.length >= minLength && 
           text.length <= maxLength && 
           !invalidPatterns.some(pattern => pattern.test(text));
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