import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faLightbulb } from '@fortawesome/free-solid-svg-icons';

const SelectedNodes = ({ nodes, onRemoveNode, onSearch }) => {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="selected-nodes-empty">
        <div className="empty-content">
          <FontAwesomeIcon icon={faLightbulb} className="empty-icon" />
          <p>点击知识图谱中的节点来添加到探索路径</p>
        </div>
        <style jsx>{`
          .selected-nodes-empty {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(229, 231, 235, 0.5);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                        0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .empty-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            color: #6B7280;
          }
          .empty-icon {
            font-size: 24px;
            color: #9CA3AF;
          }
          p {
            margin: 0;
            font-size: 14px;
            line-height: 1.5;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="selected-nodes">
      <div className="header">
        <h3>探索路径 <span className="count">({nodes.length})</span></h3>
        <button 
          className="search-button"
          onClick={() => onSearch(nodes)}
          disabled={nodes.length === 0}
        >
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          开始探索
        </button>
      </div>
      
      <AnimatePresence>
        <div className="nodes-list">
          {nodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
              className="node-item"
            >
              <div className="node-content">
                <span className="node-index">{index + 1}</span>
                <span className="node-label">{node.label}</span>
              </div>
              <button 
                className="remove-button"
                onClick={() => onRemoveNode(node)}
                aria-label="移除节点"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      <style jsx>{`
        .selected-nodes {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(229, 231, 235, 0.5);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .count {
          color: #6B7280;
          font-weight: normal;
        }

        .search-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }

        .search-button:disabled {
          background: #E5E7EB;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .nodes-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .node-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(229, 231, 235, 0.8);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .node-item:hover {
          transform: translateX(4px);
          background: white;
          border-color: #E5E7EB;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .node-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .node-index {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: #F3F4F6;
          color: #4B5563;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .node-label {
          font-size: 14px;
          color: #1F2937;
          font-weight: 500;
        }

        .remove-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: #9CA3AF;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-button:hover {
          background: #FEE2E2;
          color: #EF4444;
        }
      `}</style>
    </div>
  );
};

export default SelectedNodes; 