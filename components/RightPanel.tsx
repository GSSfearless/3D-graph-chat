import React from 'react';
import { useTranslation } from 'react-i18next';
import ResizablePanel from './ResizablePanel';
import NodeDetailsPanel from './NodeDetailsPanel';

interface RightPanelProps {
  selectedNode: any | null;
  onNodeClose: () => void;
  children: React.ReactNode; // AI Chat 内容
  className?: string;
}

const RightPanel: React.FC<RightPanelProps> = ({
  selectedNode,
  onNodeClose,
  children,
  className = '',
}) => {
  const { t } = useTranslation();

  // 如果没有选中节点，只显示AI对话
  if (!selectedNode) {
    return (
      <div className={`h-full ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      <ResizablePanel
        defaultTopHeight="40%"
        minTopHeight="30%"
        minBottomHeight="30%"
      >
        <NodeDetailsPanel
          node={selectedNode}
          onClose={onNodeClose}
        />
        {children}
      </ResizablePanel>
    </div>
  );
};

export default RightPanel; 