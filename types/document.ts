export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  structure: DocumentStructure;
  entities: Entity[];
  relations: Relation[];
  metadata: DocumentMetadata;
}

export interface DocumentStructure {
  title: string;
  sections: Section[];
}

export interface Section {
  title: string;
  level: number;
  content: string;
  subsections: Section[];
}

export interface Entity {
  id: string;
  text: string;
  type: string;
  confidence: number;
  context: string;
  properties: Record<string, any>;
}

export interface Relation {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
  weight: number;
  properties: {
    sourceText: string;
    targetText: string;
    context?: string;
  };
}

export interface DocumentMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadTime: string;
} 