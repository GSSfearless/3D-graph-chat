export class ChartParser {
  constructor() {
    this.structure = {
      headings: [],
      lists: [],
      definitions: [],
      relationships: new Map()
    };
    this.currentHeading = null;
  }

  // 解析新的内容块
  parseContent(content) {
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('§heading§')) {
        this.parseHeading(line);
      } else if (line.includes('§list§')) {
        this.parseListItem(line);
      } else if (line.includes('§definition§')) {
        this.parseDefinition(line);
      }
    });
  }

  // 解析标题
  parseHeading(line) {
    const [_, level, text] = line.match(/§heading§(#{1,6})§(.+)§/);
    const heading = {
      level: level.length,
      text: text.trim(),
      children: []
    };
    this.headings.push(heading);
    this.currentHeading = heading;
  }

  // 解析列表项
  parseListItem(line) {
    const [_, marker, text] = line.match(/§list§([\d\.\-\*])§(.+)§/);
    const item = {
      marker,
      text: text.trim(),
      parent: this.currentHeading
    };
    this.lists.push(item);
    if (this.currentHeading) {
      this.currentHeading.children.push(item);
    }
  }

  // 解析定义项
  parseDefinition(line) {
    const [_, term, definition] = line.match(/§definition§(.+?)§(.+)§/);
    this.definitions.push({
      term: term.trim(),
      definition: definition.trim()
    });
  }

  // 生成流程图代码
  generateFlowchart() {
    let code = 'flowchart TD\n';
    
    // 处理标题层级关系
    this.headings.forEach((heading, index) => {
      const id = `h${index}`;
      code += `${id}["${heading.text}"]\n`;
      
      // 连接子节点
      heading.children.forEach((child, childIndex) => {
        const childId = `${id}_${childIndex}`;
        code += `${childId}["${child.text}"]\n`;
        code += `${id} --> ${childId}\n`;
      });
    });
    
    return code;
  }

  // 生成思维导图代码
  generateMindmap() {
    let code = 'mindmap\n';
    
    // 添加根节点（第一个标题）
    if (this.headings.length > 0) {
      code += `root(("${this.headings[0].text}"))\n`;
      
      // 处理其他节点
      this.headings.slice(1).forEach((heading, index) => {
        const indent = '  '.repeat(heading.level);
        code += `${indent}${heading.text}\n`;
        
        // 添加子节点
        heading.children.forEach(child => {
          code += `${indent}  ${child.text}\n`;
        });
      });
    }
    
    return code;
  }
}

// 用于前端实时更新的辅助函数
export function updateCharts(parser, content) {
  parser.parseContent(content);
  return {
    flowchart: parser.generateFlowchart(),
    mindmap: parser.generateMindmap()
  };
} 