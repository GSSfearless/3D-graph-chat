import { EdgeType } from '../types/graph';

export const getEdgeColor = (type: EdgeType): string => {
  switch (type) {
    case EdgeType.EXPLAINS:
      return '#4CAF50'; // 绿色
    case EdgeType.EXEMPLIFIES:
      return '#2196F3'; // 蓝色
    case EdgeType.SUMMARIZES:
      return '#FFC107'; // 黄色
    case EdgeType.DETAILS:
      return '#9C27B0'; // 紫色
    default:
      return '#FFFFFF'; // 白色
  }
}; 