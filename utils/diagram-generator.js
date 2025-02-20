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
      const text = match[2].trim();
      headings.push({ level, text });
    }

    // 提取关键句子（以句号、问号、感叹号结尾的句子）
    const sentences = markdown.match(/[^。！？.!?]+[。！？.!?]/g) || [];
    const keyPoints = sentences
      .filter(s => 
        s.includes('重要') || 
        s.includes('关键') || 
        s.includes('核心') || 
        s.includes('主要') ||
        s.includes('总结') ||
        s.includes('例如') ||
        s.includes('比如')
      )
      .map(s => s.trim());

    // 提取列表项
    const listItems = [];
    const listRegex = /^[\s-]*[•·\-*]\s+(.+)$/gm;
    while ((match = listRegex.exec(markdown)) !== null) {
      listItems.push(match[1].trim());
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

  static generateFlowchart(headings, keyPoints) {
    let flowchart = 'graph LR\n';
    
    // 使用标题创建主要节点
    const nodes = headings.map((h, i) => {
      const id = `N${i}`;
      const label = h.text.length > 20 ? h.text.substring(0, 20) + '...' : h.text;
      return { id, label, level: h.level };
    });

    // 连接标题节点
    for (let i = 0; i < nodes.length - 1; i++) {
      const current = nodes[i];
      const next = nodes[i + 1];
      
      if (next.level > current.level) {
        // 子主题
        flowchart += `    ${current.id}[${current.label}] --> ${next.id}[${next.label}]\n`;
      } else if (next.level === current.level) {
        // 同级主题
        flowchart += `    ${current.id}[${current.label}] --- ${next.id}[${next.label}]\n`;
      }
    }

    // 添加关键点作为叶子节点
    keyPoints.slice(0, 5).forEach((point, i) => {
      const label = point.length > 30 ? point.substring(0, 30) + '...' : point;
      const id = `K${i}`;
      const parentId = nodes[nodes.length - 1].id;
      flowchart += `    ${parentId} --> ${id}["${label}"]\n`;
    });

    return flowchart;
  }

  static generateMindmap(headings, listItems) {
    let mindmap = 'mindmap\n';
    
    // 使用第一个标题作为根节点，如果没有标题则使用默认值
    const rootText = headings.length > 0 ? headings[0].text : '主题';
    mindmap += `  root((${rootText}))\n`;

    // 处理其他标题
    let lastLevel = 1;
    let lastIndent = '    ';

    headings.slice(1).forEach((heading) => {
      const levelDiff = heading.level - lastLevel;
      if (levelDiff > 0) {
        lastIndent += '    ';
      } else if (levelDiff < 0) {
        lastIndent = '    '.repeat(heading.level);
      }
      lastLevel = heading.level;
      
      mindmap += `${lastIndent}${heading.text}\n`;
    });

    // 添加列表项作为叶子节点
    const leafIndent = lastIndent + '    ';
    listItems.slice(0, 8).forEach(item => {
      mindmap += `${leafIndent}${item}\n`;
    });

    return mindmap;
  }
} 