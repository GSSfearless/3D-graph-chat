// 从Markdown内容生成各种图表
export class DiagramGenerator {
  static parseMarkdown(markdown) {
    if (!markdown) return {
      flowchart: '',
      mindmap: '',
      fishbone: '',
      orgchart: '',
      timeline: '',
      treechart: '',
      bracket: ''
    };

    // 提取标题结构
    const headings = [];
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim()
        .replace(/[#*`]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1');
      headings.push({ level, text });
    }

    // 提取关键句子
    const sentences = markdown.match(/[^。！？.!?]+[。！？.!?]/g) || [];
    const keyPoints = sentences
      .filter(s => {
        const cleanSentence = s.trim()
          .replace(/[#*`]/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/__([^_]+)__/g, '$1');
          
        return (
          cleanSentence.includes('重要') || 
          cleanSentence.includes('关键') || 
          cleanSentence.includes('核心') || 
          cleanSentence.includes('主要') ||
          cleanSentence.includes('总结') ||
          cleanSentence.includes('例如') ||
          cleanSentence.includes('比如') ||
          cleanSentence.includes('特点') ||
          cleanSentence.includes('优点') ||
          cleanSentence.includes('本质') ||
          cleanSentence.includes('原因') ||
          cleanSentence.includes('结果') ||
          cleanSentence.includes('影响') ||
          cleanSentence.includes('导致')
        );
      })
      .map(s => this.cleanText(s));

    // 提取列表项
    const listItems = [];
    const listRegex = /^[\s-]*[•·\-*]\s+(.+)$/gm;
    while ((match = listRegex.exec(markdown)) !== null) {
      const text = this.cleanText(match[1]);
      listItems.push(text);
    }

    // 提取时间相关信息
    const timePoints = sentences
      .filter(s => {
        const cleanSentence = s.trim().toLowerCase();
        return (
          /\d{4}年/.test(cleanSentence) ||
          /\d{4}-\d{2}/.test(cleanSentence) ||
          cleanSentence.includes('最初') ||
          cleanSentence.includes('然后') ||
          cleanSentence.includes('接着') ||
          cleanSentence.includes('最后') ||
          cleanSentence.includes('之后') ||
          cleanSentence.includes('未来') ||
          cleanSentence.includes('计划')
        );
      })
      .map(s => this.cleanText(s));

    // 提取原因和结果
    const causes = sentences
      .filter(s => s.includes('原因') || s.includes('导致') || s.includes('因为'))
      .map(s => this.cleanText(s));

    const effects = sentences
      .filter(s => s.includes('结果') || s.includes('影响') || s.includes('所以'))
      .map(s => this.cleanText(s));

    return {
      flowchart: this.generateFlowchart(headings, keyPoints),
      mindmap: this.generateMindmap(headings, listItems),
      fishbone: this.generateFishbone(causes, effects),
      orgchart: this.generateOrgChart(headings),
      timeline: this.generateTimeline(timePoints),
      treechart: this.generateTreeChart(headings),
      bracket: this.generateBracket(headings, listItems)
    };
  }

  // 生成鱼骨图
  static generateFishbone(causes, effects) {
    if (causes.length === 0 && effects.length === 0) return '';

    let fishbone = 'graph LR\n';
    fishbone += '    Problem((核心问题))\n';

    // 添加原因分支
    causes.slice(0, 6).forEach((cause, i) => {
      const id = `C${i}`;
      fishbone += `    ${id}[${this.truncateText(cause)}] -->|导致| Problem\n`;
    });

    // 添加结果分支
    effects.slice(0, 6).forEach((effect, i) => {
      const id = `E${i}`;
      fishbone += `    Problem -->|影响| ${id}[${this.truncateText(effect)}]\n`;
    });

    return fishbone;
  }

  // 生成组织结构图
  static generateOrgChart(headings) {
    if (headings.length === 0) return '';

    let orgchart = 'graph TB\n';
    const root = headings[0];
    orgchart += `    Root((${this.truncateText(root.text)}))\n`;

    let lastParent = 'Root';
    let lastLevel = 1;

    headings.slice(1).forEach((heading, i) => {
      const id = `N${i}`;
      if (heading.level > lastLevel) {
        orgchart += `    ${lastParent} --> ${id}[${this.truncateText(heading.text)}]\n`;
      } else {
        orgchart += `    Root --> ${id}[${this.truncateText(heading.text)}]\n`;
      }
      lastParent = id;
      lastLevel = heading.level;
    });

    return orgchart;
  }

  // 生成时间轴
  static generateTimeline(timePoints) {
    if (timePoints.length === 0) return '';

    let timeline = 'graph LR\n';
    timeline += '    Start((开始))\n';

    timePoints.slice(0, 8).forEach((point, i) => {
      const id = `T${i}`;
      if (i === 0) {
        timeline += `    Start --> ${id}[${this.truncateText(point)}]\n`;
      } else {
        timeline += `    T${i-1} --> ${id}[${this.truncateText(point)}]\n`;
      }
    });

    if (timePoints.length > 0) {
      timeline += `    T${timePoints.length-1} --> End((结束))\n`;
    }

    return timeline;
  }

  // 生成树形图
  static generateTreeChart(headings) {
    if (headings.length === 0) return '';

    let tree = 'graph TB\n';
    const root = headings[0];
    tree += `    Root((${this.truncateText(root.text)}))\n`;

    const levels = {};
    headings.slice(1).forEach((heading, i) => {
      const id = `N${i}`;
      if (!levels[heading.level]) {
        levels[heading.level] = [];
      }
      levels[heading.level].push({ id, text: heading.text });

      const parentLevel = heading.level - 1;
      const possibleParents = levels[parentLevel] || [];
      const parent = possibleParents[possibleParents.length - 1];

      if (parent) {
        tree += `    ${parent.id} --> ${id}[${this.truncateText(heading.text)}]\n`;
      } else {
        tree += `    Root --> ${id}[${this.truncateText(heading.text)}]\n`;
      }
    });

    return tree;
  }

  // 生成括号图
  static generateBracket(headings, listItems) {
    if (headings.length === 0 && listItems.length === 0) return '';

    let bracket = 'graph LR\n';
    bracket += '    Root((主题))\n';

    const items = [...headings, ...listItems].slice(0, 8);
    const halfLength = Math.ceil(items.length / 2);

    // 左侧分支
    items.slice(0, halfLength).forEach((item, i) => {
      const id = `L${i}`;
      bracket += `    Root --> ${id}[${this.truncateText(item.text || item)}]\n`;
    });

    // 右侧分支
    items.slice(halfLength).forEach((item, i) => {
      const id = `R${i}`;
      bracket += `    Root --> ${id}[${this.truncateText(item.text || item)}]\n`;
    });

    return bracket;
  }

  // 辅助方法
  static cleanText(text) {
    return text.trim()
      .replace(/[#*`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/^\d+\.\s*/, '');
  }

  static truncateText(text) {
    return text.length > 20 ? text.slice(0, 18) + '...' : text;
  }

  static generateFlowchart(headings, keyPoints) {
    let flowchart = 'graph LR\n';
    
    // 使用标题创建主要节点
    const nodes = headings.map((h, i) => {
      const id = `N${i}`;
      const label = this.truncateText(h.text);
      return { id, label, level: h.level };
    });

    if (nodes.length === 0) {
      // 如果没有标题，使用关键点创建节点
      const mainPoints = keyPoints.slice(0, 5).map((point, i) => ({
        id: `K${i}`,
        label: this.truncateText(point),
        level: 1
      }));
      
      // 创建一个简单的线性流程图
      flowchart += '    Start((开始))\n';
      mainPoints.forEach((point, i) => {
        flowchart += `    ${i === 0 ? 'Start' : mainPoints[i-1].id} --> ${point.id}[${point.label}]\n`;
      });
      if (mainPoints.length > 0) {
        flowchart += `    ${mainPoints[mainPoints.length-1].id} --> End((结束))\n`;
      }
      return flowchart;
    }

    // 连接标题节点
    for (let i = 0; i < nodes.length - 1; i++) {
      const current = nodes[i];
      const next = nodes[i + 1];
      
      if (next.level > current.level) {
        // 子主题
        flowchart += `    ${current.id}[${current.label}] --> ${next.id}[${next.label}]\n`;
      } else if (next.level === current.level) {
        // 同级主题
        flowchart += `    ${current.id}[${current.label}] --> ${next.id}[${next.label}]\n`;
      } else {
        // 返回上级主题
        const parent = nodes.slice(0, i).reverse()
          .find(n => n.level === next.level - 1);
        if (parent) {
          flowchart += `    ${parent.id} --> ${next.id}[${next.label}]\n`;
        }
      }
    }

    // 添加关键点作为叶子节点
    const relevantPoints = keyPoints
      .filter(point => !nodes.some(n => n.label.includes(point)))
      .slice(0, 5);

    relevantPoints.forEach((point, i) => {
      const label = this.truncateText(point);
      const id = `K${i}`;
      // 将关键点连接到最相关的标题节点
      const parentNode = nodes.find(n => 
        point.toLowerCase().includes(n.label.toLowerCase()) ||
        n.label.toLowerCase().includes(point.toLowerCase())
      ) || nodes[nodes.length - 1];
      
      flowchart += `    ${parentNode.id} --> ${id}["${label}"]\n`;
    });

    return flowchart;
  }

  static generateMindmap(headings, listItems) {
    let mindmap = 'mindmap\n';
    
    // 使用第一个标题作为根节点，如果没有标题则使用默认值
    const rootText = headings.length > 0 ? this.truncateText(headings[0].text) : '主题';
    mindmap += `  root((${rootText}))\n`;

    // 处理其他标题
    let lastLevel = 1;
    let lastIndent = '    ';
    let currentBranch = [];

    headings.slice(1).forEach((heading) => {
      const levelDiff = heading.level - lastLevel;
      
      if (levelDiff > 0) {
        currentBranch.push(lastLevel);
        lastIndent += '    ';
      } else if (levelDiff < 0) {
        currentBranch = currentBranch.slice(0, levelDiff);
        lastIndent = '    '.repeat(heading.level);
      }
      
      lastLevel = heading.level;
      const text = this.truncateText(heading.text);
      mindmap += `${lastIndent}${text}\n`;
    });

    // 智能分配列表项到最相关的标题下
    const organizedItems = this.organizeListItems(headings, listItems);
    
    organizedItems.forEach((group) => {
      const { items, level } = group;
      const indent = '    '.repeat(level + 1);
      items.forEach(item => {
        mindmap += `${indent}${this.truncateText(item)}\n`;
      });
    });

    return mindmap;
  }

  static organizeListItems(headings, listItems) {
    if (headings.length <= 1) {
      // 如果没有或只有一个标题，所有列表项放在根节点下
      return [{
        items: listItems.slice(0, 8),
        level: 1
      }];
    }

    // 尝试将列表项分配到最相关的标题下
    const organized = [];
    const usedItems = new Set();

    headings.slice(1).forEach(heading => {
      const relevantItems = listItems
        .filter(item => !usedItems.has(item) &&
          (item.toLowerCase().includes(heading.text.toLowerCase()) ||
           heading.text.toLowerCase().includes(item.toLowerCase())))
        .slice(0, 3);

      if (relevantItems.length > 0) {
        organized.push({
          items: relevantItems,
          level: heading.level
        });
        relevantItems.forEach(item => usedItems.add(item));
      }
    });

    // 未分配的列表项放在最后一个标题下
    const remainingItems = listItems
      .filter(item => !usedItems.has(item))
      .slice(0, 5);

    if (remainingItems.length > 0) {
      organized.push({
        items: remainingItems,
        level: headings[headings.length - 1].level
      });
    }

    return organized;
  }
} 