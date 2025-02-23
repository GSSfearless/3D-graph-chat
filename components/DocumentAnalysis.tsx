import React, { useState } from 'react';
import { Layout } from 'antd';
import DocumentUpload from './DocumentUpload';
import DocumentSourcePanel from './DocumentSourcePanel';
import KnowledgeGraph from './KnowledgeGraph';
import { ProcessedDocument } from '../types/document';

const { Content, Sider } = Layout;

const DocumentAnalysis: React.FC = () => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null);
  const [graphData, setGraphData] = useState<any>(null);

  const handleDocumentParsed = (doc: ProcessedDocument) => {
    setDocuments(prev => [...prev, doc]);
    updateGraphData([...documents, doc]);
  };

  const updateGraphData = (docs: ProcessedDocument[]) => {
    // 合并多个文档的知识图谱数据
    const mergedData = {
      nodes: docs.flatMap(doc => doc.entities),
      edges: docs.flatMap(doc => doc.relations)
    };
    
    // 去重并更新
    const uniqueNodes = Array.from(
      new Map(mergedData.nodes.map(node => [node.id, node])).values()
    );
    const uniqueEdges = Array.from(
      new Map(mergedData.edges.map(edge => [edge.id, edge])).values()
    );

    setGraphData({ nodes: uniqueNodes, edges: uniqueEdges });
  };

  const findNodeSource = (nodeId: string, docs: ProcessedDocument[]) => {
    return docs.find(doc => 
      doc.entities.some(entity => entity.id === nodeId)
    );
  };

  return (
    <Layout className="document-analysis-container">
      <Content className="graph-container">
        {!documents.length ? (
          <DocumentUpload onDocumentParsed={handleDocumentParsed} />
        ) : (
          <KnowledgeGraph 
            data={graphData}
            onNodeClick={(node) => {
              const sourceDoc = findNodeSource(node.id, documents);
              setSelectedDocument(sourceDoc || null);
            }}
          />
        )}
      </Content>
      
      <Sider width={400} theme="light" className="document-source-panel">
        <DocumentSourcePanel
          documents={documents}
          selectedDocument={selectedDocument}
          onDocumentSelect={setSelectedDocument}
          onDocumentUpload={() => {
            // 显示上传新文档的界面
          }}
        />
      </Sider>
    </Layout>
  );
};

export default DocumentAnalysis; 