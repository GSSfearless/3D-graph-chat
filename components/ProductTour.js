import React, { useState, useEffect } from 'react';

const tourSteps = [
  {
    title: '欢迎使用 Think Graph',
    content: '这是一个强大的知识图谱工具，让我们开始探索吧！',
    position: 'center'
  },
  {
    title: '开始搜索',
    content: '在搜索框中输入任何主题，AI 将帮助你构建知识网络',
    target: '.search-input'
  },
  {
    title: '知识图谱',
    content: '这里将展示知识点之间的关联，点击节点可以查看详细信息',
    target: '.graph-container'
  },
  {
    title: '深度思考模式',
    content: '开启此模式可以获得更详细的分析和推理过程',
    target: '.deep-thinking-toggle'
  }
];

export default function ProductTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // 检查是否是首次访问
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (hasSeenTour) {
      setIsVisible(false);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
        <p className="text-gray-600 mb-4">{step.content}</p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {currentStep + 1} / {tourSteps.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              跳过
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentStep === tourSteps.length - 1 ? '完成' : '下一步'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 