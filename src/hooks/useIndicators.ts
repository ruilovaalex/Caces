import { useState, useCallback } from 'react';
import { Indicator, YearPeriod } from '../types';
import { MOCK_DATA } from '../data/cacesMockData';
import { getAcademicPeriodsForYear } from '../utils/academicPeriodUtils';

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
  }, []);

  const openCriterionSubCriteria = useCallback((year: number, criterionId: string) => {
    const yearId = year.toString();
    const firstPeriodId = getAcademicPeriodsForYear(year)[0]?.id;
    const criterionNodeId = firstPeriodId ? `${firstPeriodId}-crit-${criterionId}` : `crit-${criterionId}`;

    setSelectedIndicator(null);
    setFocusedNodeId(criterionNodeId);
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.add(yearId);
      if (firstPeriodId) next.add(firstPeriodId);
      next.add(criterionNodeId);
      return next;
    });
  }, []);

  return {
    mockData: MOCK_DATA,
    selectedIndicator,
    expandedNodes,
    focusedNodeId,
    setSelectedIndicator,
    setFocusedNodeId,
    toggleNode,
    selectIndicator,
    openCriterionSubCriteria
  };
};
