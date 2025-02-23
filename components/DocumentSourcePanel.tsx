'use client';

import React from 'react';
import { Tabs, Card, Tree, Button, List, Tag, Space } from 'antd';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { ProcessedDocument } from '../types/document';
import type { DataNode } from 'antd/es/tree';

interface DocumentSourcePanelProps {
  documents: ProcessedDocument[];
  selectedDocument: ProcessedDocument | null;
  onDocumentSelect: (doc: ProcessedDocument) => void;
  onDocumentUpload: () => void;
}

const convertToTreeData = (structure: any): DataNode[] => {
  const { title, sections } = structure;
  return [{
    key: '0',
    title: title,
    children: sections.map((section: any, index: number) => ({
      key: `${index + 1}`,
      title: section.title,
      children: section.subsections.map((subsection: any, subIndex: number) => ({
        key: `${index + 1}-${subIndex + 1}`,
        title: subsection.title
      }))
    }))
  }];
};

const DocumentSourcePanel: React.FC<DocumentSourcePanelProps> = ({
  documents,
  selectedDocument,
  onDocumentSelect,
  onDocumentUpload
}) => {
  return (
    <div className="document-source-panel">
      <div className="panel-header">
        <h3>文档来源</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={onDocumentUpload}
        >
          添加文档
        </Button>
      </div>

      <Tabs defaultActiveKey="documents">
        <Tabs.TabPane 
          tab="文档列表" 
          key="documents"
        >
          <List
            dataSource={documents}
            renderItem={doc => (
              <List.Item
                className={`document-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
                onClick={() => onDocumentSelect(doc)}
              >
                <Space>
                  <FileTextOutlined />
                  <span>{doc.title}</span>
                  <Tag color="blue">{doc.entities.length} 个实体</Tag>
                  <Tag color="green">{doc.relations.length} 个关系</Tag>
                </Space>
              </List.Item>
            )}
          />
        </Tabs.TabPane>

        <Tabs.TabPane 
          tab="文档内容" 
          key="content"
          disabled={!selectedDocument}
        >
          {selectedDocument && (
            <div className="document-content">
              <Tree
                treeData={convertToTreeData(selectedDocument.structure)}
                onSelect={(_, info) => {
                  // 在知识图谱中高亮相关节点
                }}
              />
              <div className="content-preview">
                {selectedDocument.content}
              </div>
            </div>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane 
          tab="实体对照" 
          key="entities"
          disabled={!selectedDocument}
        >
          {selectedDocument && (
            <List
              dataSource={selectedDocument.entities}
              renderItem={entity => (
                <List.Item>
                  <Card size="small" title={entity.text}>
                    <p>来源段落：{entity.context}</p>
                    <p>置信度：{entity.confidence}</p>
                    <p>类型：{entity.type}</p>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default DocumentSourcePanel; 