'use client';

import React, { useState } from 'react';
import { Input, Button, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import KnowledgeGraph from './KnowledgeGraph';

const { TextArea } = Input;

const AISearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [graphData, setGraphData] = useState<any>(null);

  const handleSearch = async () => {
    // TODO: 实现 AI 搜索逻辑
    console.log('搜索查询:', query);
  };

  const handleNodeClick = (node: any) => {
    console.log('点击节点:', node);
  };

  return (
    <div className="ai-search-container">
      <div className="search-panel">
        <Space direction="vertical" style={{ width: '100%' }}>
          <TextArea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入你想了解的内容..."
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
          <Button 
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSearch}
          >
            生成知识图谱
          </Button>
        </Space>
      </div>

      <div className="graph-container">
        {graphData ? (
          <KnowledgeGraph 
            data={graphData}
            onNodeClick={handleNodeClick}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="empty-state">
            <p>输入内容并点击生成按钮开始探索知识图谱</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .ai-search-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 24px;
          padding: 24px;
        }

        .search-panel {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        .graph-container {
          flex: 1;
          min-height: 400px;
          background: #f8fafc;
          border-radius: 12px;
          position: relative;
        }

        .empty-state {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default AISearch; 