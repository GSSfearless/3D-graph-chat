export class NLPProcessor {
  constructor() {
    // 实体类型定义
    this.entityTypes = {
      CONCEPT: 'concept',
      PERSON: 'person',
      ORGANIZATION: 'organization',
      LOCATION: 'location',
      TIME: 'time',
      EVENT: 'event'
    };

    // 关系类型定义
    this.relationTypes = {
      IS_A: 'is_a',
      PART_OF: 'part_of',
      RELATED_TO: 'related_to',
      CAUSES: 'causes',
      BELONGS_TO: 'belongs_to'
    };
  }

  extractKnowledge(text) {
    // 1. 分句
    const sentences = this.splitSentences(text);
    
    // 2. 提取实体
    const entities = this.extractEntities(sentences);
    
    // 3. 提取关系
    const relations = this.extractRelations(sentences, entities);

    return { entities, relations };
  }

  splitSentences(text) {
    // 简单的分句规则
    return text.split(/[.!?。！？]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  extractEntities(sentences) {
    const entities = new Set();
    const entityList = [];

    sentences.forEach(sentence => {
      // 1. 提取名词短语（简单实现，实际项目中可以使用更复杂的NLP库）
      const nounPhrases = sentence.match(/\b[A-Z][a-z]*(?:\s+[A-Z][a-z]*)*\b|\b[a-z]+\b/g) || [];
      
      nounPhrases.forEach(phrase => {
        if (!entities.has(phrase)) {
          entities.add(phrase);
          entityList.push({
            text: phrase,
            type: this.classifyEntityType(phrase),
            importance: this.calculateImportance(phrase, sentences)
          });
        }
      });
    });

    return entityList;
  }

  extractRelations(sentences, entities) {
    const relations = [];
    const entityTexts = entities.map(e => e.text);

    sentences.forEach(sentence => {
      // 遍历所有实体对，检查它们是否在同一个句子中出现
      for (let i = 0; i < entityTexts.length; i++) {
        for (let j = i + 1; j < entityTexts.length; j++) {
          const entity1 = entityTexts[i];
          const entity2 = entityTexts[j];
          
          if (sentence.includes(entity1) && sentence.includes(entity2)) {
            relations.push({
              source: i,
              target: j,
              type: this.inferRelationType(sentence, entity1, entity2),
              strength: this.calculateRelationStrength(sentence, entity1, entity2)
            });
          }
        }
      }
    });

    return relations;
  }

  classifyEntityType(phrase) {
    // 简单的实体类型分类规则
    if (/^[A-Z][a-z]*(?:\s+[A-Z][a-z]*)*$/.test(phrase)) {
      if (phrase.endsWith('University') || phrase.endsWith('Corp') || phrase.endsWith('Inc')) {
        return this.entityTypes.ORGANIZATION;
      }
      return this.entityTypes.PERSON;
    }
    return this.entityTypes.CONCEPT;
  }

  inferRelationType(sentence, entity1, entity2) {
    // 简单的关系类型推断规则
    if (sentence.includes(`${entity1} is a ${entity2}`)) {
      return this.relationTypes.IS_A;
    }
    if (sentence.includes(`${entity1} is part of ${entity2}`)) {
      return this.relationTypes.PART_OF;
    }
    return this.relationTypes.RELATED_TO;
  }

  calculateImportance(phrase, sentences) {
    // 基于词频的重要性计算
    let count = 0;
    sentences.forEach(sentence => {
      const regex = new RegExp(phrase, 'gi');
      const matches = sentence.match(regex);
      if (matches) {
        count += matches.length;
      }
    });
    return Math.min(count / sentences.length, 1);
  }

  calculateRelationStrength(sentence, entity1, entity2) {
    // 基于共现距离的关系强度计算
    const distance = Math.abs(sentence.indexOf(entity1) - sentence.indexOf(entity2));
    return 1 - Math.min(distance / sentence.length, 1);
  }
} 