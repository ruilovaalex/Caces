import { YearPeriod } from '../types';

const hasIndicators = (mockData: YearPeriod[]) =>
  mockData.some(yearPeriod =>
    yearPeriod.criteria.some(criterion =>
      criterion.subCriteria.some(subCriterion => subCriterion.indicators.length > 0)
    )
  );

export const filterMockDataByAssignedIndicators = (
  mockData: YearPeriod[],
  assignedCodes: string[]
): YearPeriod[] => {
  const assignedCodeSet = new Set(assignedCodes.filter(Boolean));
  if (!assignedCodeSet.size) return mockData;

  const filteredData = mockData.map(yearPeriod => ({
    ...yearPeriod,
    criteria: yearPeriod.criteria
      .map(criterion => ({
        ...criterion,
        subCriteria: criterion.subCriteria
          .map(subCriterion => ({
            ...subCriterion,
            indicators: subCriterion.indicators.filter(indicator => assignedCodeSet.has(indicator.code))
          }))
          .filter(subCriterion => subCriterion.indicators.length > 0)
      }))
      .filter(criterion => criterion.subCriteria.length > 0)
  }));

  return hasIndicators(filteredData) ? filteredData : mockData;
};

export const getIndicatorCodesFromMockData = (mockData: YearPeriod[]) =>
  mockData.flatMap(yearPeriod =>
    yearPeriod.criteria.flatMap(criterion =>
      criterion.subCriteria.flatMap(subCriterion =>
        subCriterion.indicators.map(indicator => indicator.code)
      )
    )
  );
