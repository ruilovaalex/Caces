import { useState, useCallback, useMemo } from 'react';
import { Indicator, YearPeriod, Coordinator } from '../types';
import { MOCK_DATA } from '../data/cacesMockData';
import { getAcademicPeriodsForYear } from '../utils/academicPeriodUtils';
import { useAuth } from './useAuth';

export const useIndicators = () => {
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const { userRole, user } = useAuth();

  const filteredData = useMemo(() => {
    if (userRole === 'COORDINADOR' && user) {
      const savedCoordinators = localStorage.getItem('edusudamericano_coordinators_v1');
      if (savedCoordinators) {
        const coordinators: Coordinator[] = JSON.parse(savedCoordinators);
        const me = coordinators.find(c => c.id === user.id || c.email === user.email);
        if (me && me.assignedIndicators && me.assignedIndicators.length > 0) {
          return MOCK_DATA.map(year => ({
            ...year,
            criteria: year.criteria.map(c => ({
              ...c,
              subCriteria: c.subCriteria.map(s => ({
                ...s,
                indicators: s.indicators.filter(ind => me.assignedIndicators.includes(ind.code))
              })).filter(s => s.indicators.length > 0)
            })).filter(c => c.subCriteria.length > 0)
          })).filter(y => y.criteria.length > 0);
        } else {
          return [];
        }
      }
      return [];
    }
    return MOCK_DATA;
  }, [userRole, user]);

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
    mockData: filteredData,
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
