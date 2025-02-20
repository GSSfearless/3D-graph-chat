// 从Markdown内容生成流程图和思维导图
export class DiagramGenerator {
  static parseMarkdown(markdown) {
    if (!markdown) return {
      flowchart: '',
      mindmap: '',
      timeline: '',
      gantt: '',
      classDiagram: '',
      stateDiagram: '',
      sequenceDiagram: ''
    };

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

    // 提取时间相关的信息（用于时间线图）
    const timeEntries = this.extractTimeEntries(markdown);
    
    // 提取任务相关的信息（用于甘特图）
    const tasks = this.extractTasks(markdown);
    
    // 提取类定义相关的信息（用于类图）
    const classes = this.extractClasses(markdown);
    
    // 提取状态相关的信息（用于状态图）
    const states = this.extractStates(markdown);
    
    // 提取交互相关的信息（用于序列图）
    const sequences = this.extractSequences(markdown);

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
      mindmap,
      timeline: this.generateTimeline(timeEntries),
      gantt: this.generateGantt(tasks),
      classDiagram: this.generateClassDiagram(classes),
      stateDiagram: this.generateStateDiagram(states),
      sequenceDiagram: this.generateSequenceDiagram(sequences)
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

  // 新增的辅助方法
  static extractTimeEntries(markdown) {
    const timeRegex = /(\d{4}[-年/.]\d{1,2}[-月/.]\d{1,2}日?|\d{4}[-年/.]\d{1,2}月?|\d{4}年?)[：:]\s*(.+?)(?=\n|$)/g;
    const entries = [];
    let match;
    while ((match = timeRegex.exec(markdown)) !== null) {
      entries.push({
        date: match[1],
        event: this.cleanText(match[2])
      });
    }
    return entries;
  }

  static extractTasks(markdown) {
    const taskRegex = /- \[([ x])\]\s*(.+?)(?:\s*\((\d{4}-\d{2}-\d{2})\s*(?:到|至|~|to)\s*(\d{4}-\d{2}-\d{2})\))?/g;
    const tasks = [];
    let match;
    while ((match = taskRegex.exec(markdown)) !== null) {
      tasks.push({
        done: match[1] === 'x',
        title: this.cleanText(match[2]),
        start: match[3] || '',
        end: match[4] || ''
      });
    }
    return tasks;
  }

  static extractClasses(markdown) {
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{([^}]+)}/g;
    const classes = [];
    let match;
    while ((match = classRegex.exec(markdown)) !== null) {
      classes.push({
        name: match[1],
        extends: match[2] || '',
        members: match[3].trim().split('\n').map(line => line.trim())
      });
    }
    return classes;
  }

  static extractStates(markdown) {
    const stateRegex = /状态[:：]\s*(\w+)\s*(?:->|→)\s*(\w+)(?:\s*\((.+?)\))?/g;
    const states = [];
    let match;
    while ((match = stateRegex.exec(markdown)) !== null) {
      states.push({
        from: match[1],
        to: match[2],
        condition: match[3] || ''
      });
    }
    return states;
  }

  static extractSequences(markdown) {
    const sequenceRegex = /(\w+)\s*(?:->|→)\s*(\w+)\s*[:：]\s*(.+?)(?=\n|$)/g;
    const sequences = [];
    let match;
    while ((match = sequenceRegex.exec(markdown)) !== null) {
      sequences.push({
        from: match[1],
        to: match[2],
        message: this.cleanText(match[3])
      });
    }
    return sequences;
  }

  static generateTimeline(entries) {
    if (entries.length === 0) return '';
    
    let timeline = 'timeline\n';
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    entries.forEach(entry => {
      timeline += `    ${entry.date} : ${this.truncateText(entry.event)}\n`;
    });
    
    return timeline;
  }

  static generateGantt(tasks) {
    if (tasks.length === 0) return '';
    
    let gantt = 'gantt\n';
    gantt += '    title 项目进度\n';
    gantt += '    dateFormat YYYY-MM-DD\n';
    gantt += '    section 任务\n';
    
    tasks.forEach((task, index) => {
      const status = task.done ? 'done' : 'active';
      if (task.start && task.end) {
        gantt += `    ${this.truncateText(task.title)} :${status}, ${task.start}, ${task.end}\n`;
      } else {
        gantt += `    ${this.truncateText(task.title)} :${status}, ${index}d\n`;
      }
    });
    
    return gantt;
  }

  static generateClassDiagram(classes) {
    if (classes.length === 0) return '';
    
    let diagram = 'classDiagram\n';
    
    classes.forEach(cls => {
      if (cls.extends) {
        diagram += `    ${cls.name} --|> ${cls.extends}\n`;
      }
      
      diagram += `    class ${cls.name} {\n`;
      cls.members.forEach(member => {
        diagram += `        ${member}\n`;
      });
      diagram += '    }\n';
    });
    
    return diagram;
  }

  static generateStateDiagram(states) {
    if (states.length === 0) return '';
    
    let diagram = 'stateDiagram-v2\n';
    
    states.forEach(state => {
      if (state.condition) {
        diagram += `    ${state.from} --> ${state.to} : ${this.truncateText(state.condition)}\n`;
      } else {
        diagram += `    ${state.from} --> ${state.to}\n`;
      }
    });
    
    return diagram;
  }

  static generateSequenceDiagram(sequences) {
    if (sequences.length === 0) return '';
    
    let diagram = 'sequenceDiagram\n';
    const participants = new Set();
    
    sequences.forEach(seq => {
      participants.add(seq.from);
      participants.add(seq.to);
    });
    
    participants.forEach(p => {
      diagram += `    participant ${p}\n`;
    });
    
    sequences.forEach(seq => {
      diagram += `    ${seq.from}->>+${seq.to}: ${this.truncateText(seq.message)}\n`;
    });
    
    return diagram;
  }
} 