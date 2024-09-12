import React from 'react';

const NodeDetailsPanel = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-1/4 bg-white shadow-lg p-4 overflow-y-auto">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        Close
      </button>
      <h2 className="text-2xl font-bold mb-4">{node.data.label}</h2>
      <p className="mb-4">{node.data.description || 'No detailed description available'}</p>
      {/* You can add more detailed information, such as related links, images, etc. */}
    </div>
  );
};

export default NodeDetailsPanel;