import { useState, useEffect } from 'react';

export default function NodeDetailsPanel({ node, onClose }) {
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNodeDetails() {
      setLoading(true);
      try {
        const response = await fetch('/api/nodeDetails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodeId: node.id, label: node.data.label }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDetails(data.details);
      } catch (error) {
        console.error('Error fetching node details:', error);
        setDetails('Unable to load node details.');
      } finally {
        setLoading(false);
      }
    }

    fetchNodeDetails();
  }, [node]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">{node.data.label}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ) : (
        <p className="text-gray-700">{details}</p>
      )}
    </div>
  );
}
