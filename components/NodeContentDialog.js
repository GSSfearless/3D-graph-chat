import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faMinus, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import MarkdownIt from 'markdown-it';
import dynamic from 'next/dynamic';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
});

const NotePanel = dynamic(() => import('./NotePanel'), {
  ssr: false,
  loading: () => <div>加载笔记面板...</div>
});

const NodeContentDialog = ({ node, onClose, onMinimize, isMinimized, onMaximize, isMaximized }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const constraintsRef = useRef(null);
  const thinkingInterval = useRef(null);

  if (!node) {
    return null;
  }

  useEffect(() => {
    if (node?.data?.content) {
      setContent(node.data.content);
    }
    return () => {
      if (thinkingInterval.current) {
        clearInterval(thinkingInterval.current);
      }
    };
  }, [node]);

  const dialogClasses = `fixed ${
    isMinimized
      ? 'bottom-0 right-0 w-72 h-12'
      : isMaximized
      ? 'inset-0'
      : 'inset-10'
  } bg-white rounded-lg shadow-xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out z-50`;

  return (
    <div className={dialogClasses} ref={constraintsRef}>
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold truncate">{node?.data?.label || '未命名节点'}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={onMinimize}
            className="text-gray-500 hover:text-gray-700 p-1"
            title={isMinimized ? "展开" : "最小化"}
          >
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <button
            onClick={onMaximize}
            className="text-gray-500 hover:text-gray-700 p-1"
            title={isMaximized ? "还原" : "最大化"}
          >
            <FontAwesomeIcon icon={isMaximized ? faCompress : faExpand} />
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="关闭"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="border-b">
            <div className="flex">
              <button
                className={`px-4 py-2 ${
                  activeTab === 'content'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('content')}
              >
                内容
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === 'notes'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('notes')}
              >
                笔记
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'content' ? (
              <div className="prose max-w-none">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: content ? md.render(content) : '暂无内容',
                    }}
                  />
                )}
              </div>
            ) : (
              <NotePanel
                nodeId={node?.id || 'unknown'}
                nodeName={node?.data?.label || '未命名节点'}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NodeContentDialog; 