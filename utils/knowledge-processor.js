export class KnowledgeProcessor {
  constructor() {
    this.nodeTypes = {
      QUESTION: 'question',
      CONCEPT: 'concept',
      EXAMPLE: 'example',
      SUMMARY: 'summary',
      DETAIL: 'detail'
    };

    this.relationTypes = {
      EXPLAINS: 'explains',
      EXEMPLIFIES: 'exemplifies',
      SUMMARIZES: 'summarizes',
      DETAILS: 'details',
      RELATES_TO: 'relates_to'
    };
  }

  processSearchResponse(content) {
    const mainQuestion = this.extractMainQuestion(content);
    const { concepts, examples, summaries, details } = this.extractKnowledgeElements(content);
    return this.buildGraphData(mainQuestion, concepts, examples, summaries, details);
  }

  extractMainQuestion(text) {
    // 提取主要问题，通常是第一句话或带有问号的句子
    const questionMatch = text.match(/^[^。！？.!?]+[？?]/);
    if (questionMatch) {
      return {
        content: questionMatch[0].trim(),
        type: this.nodeTypes.QUESTION,
        importance: 1.0,
        depth: 0
      };
    }
    return null;
  }

  extractKnowledgeElements(text) {
    const concepts = new Set();
    const examples = new Map();
    const summaries = new Map();
    const details = new Map();

    // 分段处理
    const paragraphs = text.split('\n').filter(p => p.trim());
    
    paragraphs.forEach(paragraph => {
      // 提取概念（通常是关键词或重要短语）
      const conceptMatches = paragraph.match(/([一个])?([的地得])?([^，。！？,!?]{2,})/g) || [];
      conceptMatches.forEach(match => {
        const concept = match.trim();
        if (this.isValidConcept(concept)) {
          concepts.add({
            content: concept,
            type: this.nodeTypes.CONCEPT,
            importance: this.calculateImportance(concept, text),
            depth: 1
          });
        }
      });

      // 提取示例（通常跟在"例如"、"比如"等词后面）
      const exampleMatches = paragraph.match(/(?:例如|比如|举例)[：:]?([^。！？]+)/g) || [];
      exampleMatches.forEach(match => {
        const example = match.replace(/(?:例如|比如|举例)[：:]?/, '').trim();
        if (example) {
          const relatedConcept = this.findRelatedConcept(example, concepts);
          if (relatedConcept) {
            if (!examples.has(relatedConcept)) {
              examples.set(relatedConcept, []);
            }
            examples.get(relatedConcept).push({
              content: example,
              type: this.nodeTypes.EXAMPLE,
              importance: 0.7,
              depth: 2
            });
          }
        }
      });

      // 提取总结（通常在段落末尾或带有"总之"、"总结"等词）
      const summaryMatches = paragraph.match(/(?:总之|总结|综上)[^。！？]+[。！？]/g) || [];
      summaryMatches.forEach(match => {
        const summary = match.trim();
        const relatedConcept = this.findRelatedConcept(summary, concepts);
        if (relatedConcept) {
          if (!summaries.has(relatedConcept)) {
            summaries.set(relatedConcept, []);
          }
          summaries.get(relatedConcept).push({
            content: summary,
            type: this.nodeTypes.SUMMARY,
            importance: 0.8,
            depth: 2
          });
        }
      });

      // 提取细节（补充说明和详细内容）
      const detailMatches = paragraph.match(/(?:具体来说|详细地说|也就是说)[^。！？]+[。！？]/g) || [];
      detailMatches.forEach(match => {
        const detail = match.trim();
        const relatedConcept = this.findRelatedConcept(detail, concepts);
        if (relatedConcept) {
          if (!details.has(relatedConcept)) {
            details.set(relatedConcept, []);
          }
          details.get(relatedConcept).push({
            content: detail,
            type: this.nodeTypes.DETAIL,
            importance: 0.6,
            depth: 3
          });
        }
      });
    });

    return {
      concepts: Array.from(concepts),
      examples: Array.from(examples.entries()),
      summaries: Array.from(summaries.entries()),
      details: Array.from(details.entries())
    };
  }

  buildGraphData(mainQuestion, concepts, examples, summaries, details) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // 添加主问题节点
    if (mainQuestion) {
      const questionId = this.generateId(mainQuestion.content);
      nodes.push({
        id: questionId,
        ...mainQuestion
      });
      nodeMap.set(mainQuestion.content, questionId);
    }

    // 添加概念节点
    concepts.forEach(concept => {
      const nodeId = this.generateId(concept.content);
      nodes.push({
        id: nodeId,
        ...concept
      });
      nodeMap.set(concept.content, nodeId);

      // 连接到主问题
      if (mainQuestion) {
        edges.push({
          id: `${nodeMap.get(mainQuestion.content)}-${nodeId}`,
          source: nodeMap.get(mainQuestion.content),
          target: nodeId,
          relationship: {
            type: this.relationTypes.EXPLAINS,
            label: '解释',
            strength: concept.importance
          }
        });
      }
    });

    // 添加示例节点和边
    examples.forEach(([concept, exampleList]) => {
      const conceptId = nodeMap.get(concept);
      if (conceptId) {
        exampleList.forEach(example => {
          const exampleId = this.generateId(example.content);
          nodes.push({
            id: exampleId,
            ...example
          });
          edges.push({
            id: `${conceptId}-${exampleId}`,
            source: conceptId,
            target: exampleId,
            relationship: {
              type: this.relationTypes.EXEMPLIFIES,
              label: '举例',
              strength: 0.7
            }
          });
        });
      }
    });

    // 添加总结节点和边
    summaries.forEach(([concept, summaryList]) => {
      const conceptId = nodeMap.get(concept);
      if (conceptId) {
        summaryList.forEach(summary => {
          const summaryId = this.generateId(summary.content);
          nodes.push({
            id: summaryId,
            ...summary
          });
          edges.push({
            id: `${conceptId}-${summaryId}`,
            source: conceptId,
            target: summaryId,
            relationship: {
              type: this.relationTypes.SUMMARIZES,
              label: '总结',
              strength: 0.8
            }
          });
        });
      }
    });

    // 添加细节节点和边
    details.forEach(([concept, detailList]) => {
      const conceptId = nodeMap.get(concept);
      if (conceptId) {
        detailList.forEach(detail => {
          const detailId = this.generateId(detail.content);
          nodes.push({
            id: detailId,
            ...detail
          });
          edges.push({
            id: `${conceptId}-${detailId}`,
            source: conceptId,
            target: detailId,
            relationship: {
              type: this.relationTypes.DETAILS,
              label: '详述',
              strength: 0.6
            }
          });
        });
      }
    });

    return {
      nodes,
      edges
    };
  }

  calculateImportance(concept, text) {
    // 基于出现频率和位置计算重要性
    const frequency = (text.match(new RegExp(concept, 'g')) || []).length;
    const position = text.indexOf(concept) / text.length;
    return Math.min(1, (frequency * 0.3 + (1 - position) * 0.7));
  }

  findRelatedConcept(text, concepts) {
    // 找到与文本最相关的概念
    let maxSimilarity = 0;
    let relatedConcept = null;

    concepts.forEach(concept => {
      const similarity = this.calculateTextSimilarity(text, concept.content);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        relatedConcept = concept.content;
      }
    });

    return relatedConcept;
  }

  calculateTextSimilarity(text1, text2) {
    // 简单的文本相似度计算
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    return intersection.size / Math.max(words1.size, words2.size);
  }

  generateId(text) {
    return text.slice(0, 20).replace(/\s+/g, '_').toLowerCase() +
           '_' + Math.random().toString(36).substr(2, 9);
  }

  isValidConcept(text) {
    return text.length >= 2 && 
           !text.match(/^[的地得]/) && 
           !text.match(/[的地得]$/);
  }
} 