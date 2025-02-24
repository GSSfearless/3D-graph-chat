import React, { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';
import { Star, Clock, Settings, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
}

interface Favorite {
  id: string;
  name: string;
  timestamp: Date;
}

interface GraphControls {
  nodeSize: number;
  edgeWidth: number;
  edgeAnimated: boolean;
}

interface LeftSidebarProps {
  onControlsChange: (controls: GraphControls) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onControlsChange }) => {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([
    { id: '1', query: '人工智能发展历史', timestamp: new Date() },
    { id: '2', query: '机器学习基础概念', timestamp: new Date() },
  ]);

  const [favorites, setFavorites] = useState<Favorite[]>([
    { id: '1', name: '深度学习知识图谱', timestamp: new Date() },
    { id: '2', name: '计算机视觉研究方向', timestamp: new Date() },
  ]);

  const [controls, setControls] = useState<GraphControls>({
    nodeSize: 50,
    edgeWidth: 2,
    edgeAnimated: true,
  });

  const handleControlChange = (updates: Partial<GraphControls>) => {
    const newControls = { ...controls, ...updates };
    setControls(newControls);
    onControlsChange(newControls);
  };

  const removeHistoryItem = (id: string) => {
    setSearchHistory(history => history.filter(item => item.id !== id));
  };

  const removeFavorite = (id: string) => {
    setFavorites(favs => favs.filter(item => item.id !== id));
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <Accordion.Root type="single" collapsible className="w-full">
        {/* 搜索历史部分 */}
        <Accordion.Item value="history" className="border-b border-gray-200">
          <Accordion.Trigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">搜索历史</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200 ease-in-out accordion-chevron" />
          </Accordion.Trigger>
          <Accordion.Content className="px-4 py-2 space-y-2">
            {searchHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <span className="text-sm text-gray-600 truncate flex-1">{item.query}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => removeHistoryItem(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </Button>
              </div>
            ))}
          </Accordion.Content>
        </Accordion.Item>

        {/* 收藏部分 */}
        <Accordion.Item value="favorites" className="border-b border-gray-200">
          <Accordion.Trigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">收藏</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200 ease-in-out accordion-chevron" />
          </Accordion.Trigger>
          <Accordion.Content className="px-4 py-2 space-y-2">
            {favorites.map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <span className="text-sm text-gray-600 truncate flex-1">{item.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => removeFavorite(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </Button>
              </div>
            ))}
          </Accordion.Content>
        </Accordion.Item>

        {/* 图表控制部分 */}
        <Accordion.Item value="controls" className="border-b border-gray-200">
          <Accordion.Trigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">图表控制</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200 ease-in-out accordion-chevron" />
          </Accordion.Trigger>
          <Accordion.Content className="px-4 py-4 space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-600 block">节点大小</label>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[controls.nodeSize]}
                max={100}
                min={20}
                step={1}
                onValueChange={([value]) => handleControlChange({ nodeSize: value })}
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:shadow-[0_0_0_2px] focus:shadow-blue-500"
                  aria-label="节点大小"
                />
              </Slider.Root>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600 block">连线宽度</label>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[controls.edgeWidth]}
                max={10}
                min={1}
                step={0.5}
                onValueChange={([value]) => handleControlChange({ edgeWidth: value })}
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:shadow-[0_0_0_2px] focus:shadow-blue-500"
                  aria-label="连线宽度"
                />
              </Slider.Root>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">连线动画</label>
              <Switch.Root
                checked={controls.edgeAnimated}
                onCheckedChange={(checked) => handleControlChange({ edgeAnimated: checked })}
                className="w-10 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-500 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[18px]" />
              </Switch.Root>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      <style jsx>{`
        .accordion-chevron {
          transform: rotate(0deg);
          transition: transform 0.2s ease-in-out;
        }
        [data-state="open"] .accordion-chevron {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
};

export default LeftSidebar; 