import { useState, useCallback } from 'react';
import { Indicator, YearPeriod } from '../types';
import { MOCK_DATA } from '../data/cacesMockData';

export const useIndicators = () => {
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const selectIndicator = useCallback((indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setFocusedNodeId(`ind-${indicator.code}`);
  }, []);

  return {
    mockData: MOCK_DATA,
    selectedIndicator,
    expandedNodes,
    focusedNodeId,
    setSelectedIndicator,
    setFocusedNodeId,
    toggleNode,
    selectIndicator
  };
};
