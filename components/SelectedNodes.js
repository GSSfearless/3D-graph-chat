import React from 'react';

const SelectedNodes = ({ nodes, onRemoveNode, onSearch }) => {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="selected-nodes-container">
        <div className="selected-nodes-header">
          <h3>已选择的节点</h3>
        </div>
        <div className="empty-state">
          点击知识图谱中的节点来添加到探索路径
        </div>
        <style jsx>{`
          .selected-nodes-container {
            background: white;
            border-radius: 8px;
            padding: 16px;
            margin-top: 16px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .selected-nodes-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
          .selected-nodes-header h3 {
            margin: 0;
            font-size: 16px;
            color: #1a1a1a;
          }
          .empty-state {
            color: #666;
            text-align: center;
            padding: 20px 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="selected-nodes-container">
      <div className="selected-nodes-header">
        <h3>已选择的节点 ({nodes.length})</h3>
        <button 
          className="search-button"
          onClick={() => onSearch(nodes)}
          disabled={nodes.length === 0}
        >
          开始探索
        </button>
      </div>
      <div className="nodes-list">
        {nodes.map((node, index) => (
          <div key={node.id} className="node-item">
            <span className="node-index">{index + 1}</span>
            <span className="node-label">{node.label}</span>
            <button 
              className="remove-button"
              onClick={() => onRemoveNode(node)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <style jsx>{`
        .selected-nodes-container {
          background: white;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .selected-nodes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .selected-nodes-header h3 {
          margin: 0;
          font-size: 16px;
          color: #1a1a1a;
        }
        .search-button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .search-button:hover {
          background: #4338ca;
        }
        .search-button:disabled {
          background: #c7c7c7;
          cursor: not-allowed;
        }
        .nodes-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .node-item {
          display: flex;
          align-items: center;
          padding: 8px;
          background: #f8fafc;
          border-radius: 6px;
          gap: 8px;
        }
        .node-index {
          background: #e2e8f0;
          color: #475569;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 12px;
        }
        .node-label {
          flex: 1;
          font-size: 14px;
          color: #1a1a1a;
        }
        .remove-button {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 18px;
          cursor: pointer;
          padding: 0 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .remove-button:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default SelectedNodes; 