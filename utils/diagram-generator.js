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
    
    // 使用第一个标题作为中心主题
    const rootText = headings.length > 0 ? this.truncateText(headings[0].text) : '中心主题';
    mindmap += `  root((${rootText}))\n`;

    // 将其他标题组织成主要分支
    const mainBranches = this.organizeMainBranches(headings.slice(1), listItems);
    
    // 生成主要分支
    mainBranches.forEach((branch, index) => {
      const indent = '    ';
      const { title, items } = branch;
      
      // 添加主分支
      mindmap += `${indent}${title}\n`;
      
      // 添加子项
      if (items && items.length > 0) {
        items.forEach(item => {
          mindmap += `${indent}${indent}${this.truncateText(item)}\n`;
        });
      }
    });

    return mindmap;
  }

  static organizeMainBranches(headings, listItems) {
    // 如果没有标题，将列表项直接作为主分支
    if (headings.length === 0) {
      const groups = this.groupListItems(listItems);
      return groups.map((items, i) => ({
        title: `主题${i + 1}`,
        items
      }));
    }

    // 将标题和相关的列表项组织成分支
    const branches = [];
    const usedItems = new Set();

    // 处理每个标题
    headings.forEach(heading => {
      const branch = {
        title: this.truncateText(heading.text),
        items: []
      };

      // 查找与该标题相关的列表项
      const relevantItems = listItems
        .filter(item => !usedItems.has(item) &&
          (item.toLowerCase().includes(heading.text.toLowerCase()) ||
           heading.text.toLowerCase().includes(item.toLowerCase())))
        .slice(0, 3);

      branch.items.push(...relevantItems);
      relevantItems.forEach(item => usedItems.add(item));
      branches.push(branch);
    });

    // 处理未分配的列表项
    const remainingItems = listItems.filter(item => !usedItems.has(item));
    if (remainingItems.length > 0) {
      const groups = this.groupListItems(remainingItems);
      groups.forEach((items, i) => {
        if (branches.length < 4) { // 限制主分支数量
          branches.push({
            title: `相关主题${i + 1}`,
            items
          });
        }
      });
    }

    // 确保分支数量平衡（最多4个主分支）
    return branches.slice(0, 4);
  }

  static groupListItems(items) {
    // 将列表项分组，每组2-3个项目
    const groups = [];
    let currentGroup = [];
    
    items.forEach(item => {
      currentGroup.push(item);
      if (currentGroup.length === 3) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  }
} 