import React, { useMemo, useState, useEffect } from 'react';
import { Folder, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { YearPeriod, UploadedFile, Indicator } from '../../types';
import { calculateIndicatorProgress } from '../../utils/progressUtils';
import { WorkflowGuide } from './WorkflowGuide';
import { PageHeader } from '../common/PageHeader';
import { EmptyState } from '../common/EmptyState';
import { staggerContainer, fadeInUp, hoverScale, tapScale, hoverCardLift, useCountUp } from '../../utils/animations';



interface DashboardProps {
  mockData: YearPeriod[];
  allFiles: UploadedFile[];
  onIndicatorSelect: (ind: Indicator) => void;
  onViewChecklist: () => void;
  onOpenCriterionSubCriteria: (year: number, criterionId: string) => void;
  onOpenAssignments: () => void;
  canManageAssignments: boolean;
  isScopedView?: boolean;
}

export const Dashboard = ({
  mockData,
  allFiles,
  onIndicatorSelect,
  onViewChecklist,
  onOpenCriterionSubCriteria,
  onOpenAssignments,
  canManageAssignments,
  isScopedView = false
}: DashboardProps) => {
  const activeYearPeriod = mockData[0];
  const criteria = activeYearPeriod?.criteria || [];

  const visibleIndicatorCodes = useMemo(
    () => new Set(
      criteria.flatMap(criterion =>
        criterion.subCriteria.flatMap(subCriterion =>
          subCriterion.indicators.map(indicator => indicator.code)
        )
      )
    ),
    [criteria]
  );

  const visibleFiles = useMemo(
    () => allFiles.filter(file => visibleIndicatorCodes.has(file.indicatorCode)),
    [allFiles, visibleIndicatorCodes]
  );

  const dashboardStats = useMemo(() => {
    const totalEvidences = criteria.reduce(
      (acc, criterion) => acc + criterion.subCriteria.reduce(
        (subAcc, subCriterion) => subAcc + subCriterion.indicators.reduce(
          (indicatorAcc, indicator) => indicatorAcc + indicator.requirements.length,
          0
        ),
        0
      ),
      0
    );

    return {
      totalEvidences,
      loaded: visibleFiles.filter(file => file.isCurrentVersion).length,
      validated: visibleFiles.filter(file => file.status === 'Validado' && file.isCurrentVersion).length,
      observed: visibleFiles.filter(file => file.status === 'Observado' && file.isCurrentVersion).length
    };
  }, [criteria, visibleFiles]);

  const pendingIndicators = useMemo(
    () => criteria
      .flatMap(criterion => criterion.subCriteria.flatMap(subCriterion => subCriterion.indicators))
      .filter(indicator => indicator.status === 'Pendiente')
      .slice(0, 5),
    [criteria]
  );

  const subCriterionProgress = useMemo(() => {
    const progressBySubCriterion = new Map<string, number>();

    criteria.forEach(criterion => {
      criterion.subCriteria.forEach(subCriterion => {
        const progress = Math.round(
          subCriterion.indicators.reduce((sum, indicator) => sum + calculateIndicatorProgress(indicator, visibleFiles), 0) /
          (subCriterion.indicators.length || 1)
        );
        progressBySubCriterion.set(subCriterion.id, progress);
      });
    });

    return progressBySubCriterion;
  }, [criteria, visibleFiles]);

  const totalCount = useCountUp(dashboardStats.totalEvidences);
  const loadedCount = useCountUp(dashboardStats.loaded);
  const validCount = useCountUp(dashboardStats.validated);
  const observedCount = useCountUp(dashboardStats.observed);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PageHeader
        title={isScopedView ? 'Indicadores asignados' : 'Panel de acreditación'}
        description={isScopedView ? 'Seguimiento de las evidencias bajo tu responsabilidad.' : 'Estado consolidado del repositorio institucional CACES.'}
        breadcrumbs={['Inicio']}
      />
      <WorkflowGuide
        activeStep="repository"
        canManageAssignments={canManageAssignments}
        onOpenAssignments={onOpenAssignments}
      />

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <motion.div variants={fadeInUp} className="premium-card bg-white p-5 rounded-lg border-l-4 border-l-[#2563eb] space-y-2">
          <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest leading-none">
            {isScopedView ? 'Evidencias asignadas' : 'Total Evidencias'}
          </span>
          <h3 className="text-2xl font-black text-[#0f172a]">
            {totalCount}
          </h3>
        </motion.div>
        <motion.div variants={fadeInUp} className="premium-card bg-white p-5 rounded-lg border-l-4 border-l-[#2563eb] space-y-2">
          <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest leading-none">Cargadas</span>
          <h3 className="text-2xl font-black text-[#2563eb]">
             {loadedCount}
          </h3>
        </motion.div>
        <motion.div variants={fadeInUp} className="premium-card bg-white p-5 rounded-lg border-l-4 border-l-[#15803d] space-y-2">
          <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest leading-none">Validadas</span>
          <h3 className="text-2xl font-black text-[#15803d]">
             {validCount}
          </h3>
        </motion.div>
        <motion.div variants={fadeInUp} className="premium-card bg-white p-5 rounded-lg border-l-4 border-l-[#dc2626] space-y-2">
          <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest leading-none">Observadas</span>
          <h3 className="text-2xl font-black text-[#dc2626]">
             {observedCount}
          </h3>
        </motion.div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">
            {isScopedView ? 'CRITERIOS ASIGNADOS' : 'CRITERIOS'}
          </h3>
        </div>
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2"
        >
          {criteria.map((crit, index) => (
            <motion.button
              variants={fadeInUp}
              whileHover={hoverCardLift}
              type="button"
              key={crit.id} 
              onClick={() => activeYearPeriod && onOpenCriterionSubCriteria(activeYearPeriod.year, crit.id)}
              className="premium-card bg-white p-6 rounded-lg border border-[#e2e8f0] hover:border-[#2563eb] transition-all cursor-pointer group text-left"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#2563eb] rounded-lg text-white transition-all">
                  <Folder className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Criterio {crit.id}</span>
              </div>
              <h4 className="font-bold text-[#0f172a] mb-1">{crit.name}</h4>
              <p className="text-[10px] text-[#64748b] font-bold uppercase mb-6">
                {crit.subCriteria.length} Subcriterios • {crit.subCriteria.reduce((acc, sub) => acc + sub.indicators.length, 0)} Indicadores
              </p>
              <div className="space-y-4">
                 {crit.subCriteria.map(sub => {
                   const subProgress = subCriterionProgress.get(sub.id) || 0;
                   return (
                     <div key={sub.id} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                         <span className="text-[#64748b] truncate max-w-[80%]">{sub.name}</span>
                         <span className="text-[#2563eb]">{subProgress}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                         <motion.div 
                           className="h-full bg-[#22c55e] rounded-full" 
                           initial={{ width: '0%' }}
                           whileInView={{ width: `${subProgress}%` }}
                           viewport={{ once: true }}
                           transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 + index * 0.1 }}
                         />
                       </div>
                     </div>
                   );
                 })}
              </div>
            </motion.button>
          ))}
        </motion.div>

        <div className="premium-card bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          <div className="p-6 border-b border-[#f1f5f9] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Atención Requerida: Evidencias Pendientes</h3>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo CACES 2024</span>
          </div>
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="divide-y divide-slate-50"
          >
            {pendingIndicators.map(ind => (
              <motion.div 
                variants={fadeInUp}
                key={ind.code} 
                onClick={() => onIndicatorSelect(ind)}
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                    {ind.code}
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-700">{ind.name}</p>
                     <div className="flex gap-2 mt-1">
                       {ind.requirements.slice(0, 2).map(r => (
                         <span key={r.id} className="text-[9px] font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded italic">Falta: {r.label}</span>
                       ))}
                     </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-all" />
              </motion.div>
            ))}
            {pendingIndicators.length === 0 && (
              <EmptyState icon={CheckCircle2} title="No hay indicadores pendientes" description="Las evidencias visibles no requieren atención inmediata." />
            )}
          </motion.div>
          <div className="p-4 bg-slate-50/50 text-center border-t border-slate-50">
            <motion.button 
              whileHover={hoverScale}
              whileTap={tapScale}
              onClick={onViewChecklist}
              className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.2em] transition-colors"
            >
              Visualizar todos los requerimientos
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
