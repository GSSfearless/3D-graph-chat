import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import { marked } from 'marked';
import { ProcessedDocument, DocumentStructure, Section } from '../types/document';
import { extractEntities, extractRelations } from './nlp-utils';

export const processDocument = async (file: File): Promise<ProcessedDocument> => {
  const fileType = getFileType(file);
  let content = '';

  switch (fileType) {
    case 'pdf':
      content = await processPDF(file);
      break;
    case 'docx':
      content = await processWord(file);
      break;
    case 'txt':
      content = await processText(file);
      break;
    case 'md':
      content = await processMarkdown(file);
      break;
    default:
      throw new Error('不支持的文件格式');
  }

  // 解析文档结构
  const structure = await analyzeDocumentStructure(content);
  
  // 提取实体和关系
  const entities = await extractEntities(content);
  const relations = await extractRelations(content);

  return {
    id: generateDocumentId(),
    title: file.name,
    content,
    structure,
    entities,
    relations,
    metadata: {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      uploadTime: new Date().toISOString()
    }
  };
};

const getFileType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'docx':
      return 'docx';
    case 'txt':
      return 'txt';
    case 'md':
      return 'md';
    default:
      throw new Error('不支持的文件格式');
  }
};

const processPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  
  let content = '';
  for (const page of pages) {
    const text = await page.getText();
    content += text + '\n';
  }
  
  return content;
};

const processWord = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const processText = async (file: File): Promise<string> => {
  return await file.text();
};

const processMarkdown = async (file: File): Promise<string> => {
  const text = await file.text();
  return marked(text);
};

const analyzeDocumentStructure = async (content: string): Promise<DocumentStructure> => {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  for (const line of lines) {
    const headingLevel = getHeadingLevel(line);
    if (headingLevel > 0) {
      const newSection = {
        title: line.replace(/^#+\s+/, '').trim(),
        level: headingLevel,
        content: '',
        subsections: []
      };

      if (!currentSection || headingLevel <= currentSection.level) {
        sections.push(newSection);
        currentSection = newSection;
      } else {
        currentSection.subsections.push(newSection);
      }
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  return {
    title: sections[0]?.title || '未命名文档',
    sections
  };
};

const getHeadingLevel = (line: string): number => {
  const match = line.match(/^(#+)\s/);
  return match ? match[1].length : 0;
};

const generateDocumentId = (): string => {
  return 'doc_' + Math.random().toString(36).substr(2, 9);
}; 