export interface AcademicPeriodOption {
  id: string;
  label: string;
}

export const getAcademicPeriodsForYear = (year: number): AcademicPeriodOption[] => [
  {
    id: `period-${year}-aug-feb`,
    label: `Agosto ${year - 1} - Febrero ${year}`,
  },
  {
    id: `period-${year}-feb-aug`,
    label: `Febrero ${year} - Agosto ${year}`,
  },
];
