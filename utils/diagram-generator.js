// 从Markdown内容生成流程图和思维导图
export class DiagramGenerator {
  static parseMarkdown(markdown) {
    if (!markdown) return { flowchart: '', mindmap: '' };

    // 提取标题结构
    const headings = [];
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      // 移除标题中的Markdown符号
      const text = match[2].trim()
        .replace(/[#*`]/g, '')  // 移除#、*、`等符号
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // 将[文本](链接)转换为文本
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // 移除加粗符号
        .replace(/__([^_]+)__/g, '$1');  // 移除下划线强调
      headings.push({ level, text });
    }

    // 提取关键句子（以句号、问号、感叹号结尾的句子）
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
          cleanSentence.includes('本质')
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

    // 生成流程图
    const flowchart = this.generateFlowchart(headings, keyPoints);

    // 生成思维导图
    const mindmap = this.generateMindmap(headings, listItems);

    return {
      flowchart,
      mindmap
    };
  }

  // 清理文本的辅助方法
  static cleanText(text) {
    return text.trim()
      .replace(/[#*`]/g, '')  // 移除#、*、`等符号
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // 将[文本](链接)转换为文本
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // 移除加粗符号
      .replace(/__([^_]+)__/g, '$1')  // 移除下划线强调
      .replace(/^\d+\.\s+/, '')  // 移除数字编号
      .replace(/^[-•]\s+/, '');  // 移除列表符号
  }

  // 智能截断文本的辅助方法
  static truncateText(text, maxLength = 40) {
    if (text.length <= maxLength) return text;
    
    // 尝试在标点符号处截断
    const punctuationMatch = text.slice(0, maxLength + 10).match(/[，。；：！？,;:!?]/);
    if (punctuationMatch) {
      return text.slice(0, punctuationMatch.index + 1);
    }
    
    // 如果没有标点符号，在词语边界截断
    return text.slice(0, maxLength) + '...';
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