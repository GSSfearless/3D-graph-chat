import React, { useState, useEffect } from 'react';

const WebCollectionAnimation = ({ isCollecting, collectedCount }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isCollecting) {
      const interval = setInterval(() => {
        setDots(prev => (prev.length < 3 ? prev + '.' : ''));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isCollecting]);

  if (!isCollecting) return null;

  return (
    <div className="web-collection-animation">
      <div className="animation-container">
        <div className="globe"></div>
        <div className="web-icon"></div>
      </div>
      <p className="collection-text">
        正在搜集网页{dots}<br />
        已收集 {collectedCount} 个网页
      </p>
      <style jsx>{`
        .web-collection-animation {
          text-align: center;
          padding: 20px;
        }
        .animation-container {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto;
        }
        .globe {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid #3498db;
          animation: rotate 4s linear infinite;
        }
        .web-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background-image: url('/web-icon.svg');
          background-size: contain;
          animation: pulse 2s ease-in-out infinite;
        }
        .collection-text {
          margin-top: 10px;
          font-size: 14px;
          color: #333;
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default WebCollectionAnimation;
