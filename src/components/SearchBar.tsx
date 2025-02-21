import React from 'react';
import { Node, NodeType } from '../types/graph';

interface SearchBarProps {
  nodes: Node[];
  onSelectNode: (node: Node) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ nodes, onSelectNode }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const filteredNodes = React.useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return nodes
      .filter(node => 
        node.content.toLowerCase().includes(term) ||
        node.type.toLowerCase().includes(term)
      )
      .slice(0, 5); // 限制显示前5个结果
  }, [nodes, searchTerm]);

  const handleSelect = (node: Node) => {
    onSelectNode(node);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 z-10">
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="搜索节点..."
            className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
          >
            {searchTerm ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>
        </div>

        {isOpen && filteredNodes.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {filteredNodes.map(node => (
              <button
                key={node.id}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 focus:outline-none"
                onClick={() => handleSelect(node)}
              >
                <div className="flex items-center">
                  <span className="flex-1 text-white">{node.content}</span>
                  <span className="text-sm text-gray-400 ml-2">
                    {node.type}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 