import React, { useMemo, useState, useEffect } from 'react';
import { Folder, ChevronRight, AlertCircle, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { YearPeriod, UploadedFile, Indicator, PresentialVerification } from '../../types';
import { AcademicPeriodOption } from '../../utils/academicPeriodUtils';
import {
  calculateIndicatorProgress,
  getDocumentalRequirements,
  getPendingIndicators,
  getPresentialStats,
  isPresentialRequirement,
} from '../../utils/progressUtils';
import { staggerContainer, fadeInUp, hoverScale, tapScale, hoverCardLift, useCountUp } from '../../utils/animations';



interface DashboardProps {
  mockData: YearPeriod[];
  allFiles: UploadedFile[];
  verifications: PresentialVerification[];
  periods: AcademicPeriodOption[];
  activePeriodId: string;
  onChangePeriod: (periodId: string) => void;
  onIndicatorSelect: (ind: Indicator) => void;
  onViewChecklist: () => void;
  onOpenCriterionSubCriteria: (year: number, criterionId: string) => void;
  onOpenAssignments: () => void;
  canManageAssignments: boolean;
}

export const Dashboard = ({
  mockData,
  allFiles,
  verifications,
  periods,
  activePeriodId,
  onChangePeriod,
  onIndicatorSelect,
  onViewChecklist,
  onOpenCriterionSubCriteria,
  onOpenAssignments: _onOpenAssignments,
  canManageAssignments: _canManageAssignments
}: DashboardProps) => {
  const allIndicators = useMemo(
    () => mockData[0].criteria.flatMap(criterion => criterion.subCriteria.flatMap(subCriterion => subCriterion.indicators)),
    [mockData]
  );

  // Progreso documental: las evidencias presenciales se cuentan aparte, en presentialStats.
  const dashboardStats = useMemo(() => {
    const totalEvidences = allIndicators.reduce(
      (acc, indicator) => acc + getDocumentalRequirements(indicator).length,
      0
    );
    const documentalFiles = allFiles.filter(
      file => file.isCurrentVersion && !isPresentialRequirement(file.indicatorCode, file.requirementId)
    );

    return {
      totalEvidences,
      loaded: documentalFiles.length,
      validated: documentalFiles.filter(file => file.status === 'Validado').length,
      observed: documentalFiles.filter(file => file.status === 'Observado').length
    };
  }, [allFiles, allIndicators]);

  const presentialStats = useMemo(
    () => getPresentialStats(allIndicators, verifications),
    [allIndicators, verifications]
  );
  const presentialProgress = presentialStats.total
    ? Math.round((presentialStats.verified / presentialStats.total) * 100)
    : 0;

  const pendingIndicators = useMemo(
    () => getPendingIndicators(allIndicators, allFiles),
    [allFiles, allIndicators]
  );

  const subCriterionProgress = useMemo(() => {
    const progressBySubCriterion = new Map<string, number>();

    mockData[0].criteria.forEach(criterion => {
      criterion.subCriteria.forEach(subCriterion => {
        const documentalProgress = subCriterion.indicators
          .map(indicator => calculateIndicatorProgress(indicator, allFiles))
          .filter((value): value is number => value !== null);
        const progress = Math.round(
          documentalProgress.reduce((sum, value) => sum + value, 0) / (documentalProgress.length || 1)
        );
        progressBySubCriterion.set(subCriterion.id, progress);
      });
    });

    return progressBySubCriterion;
  }, [allFiles, mockData]);

  const totalCount = useCountUp(dashboardStats.totalEvidences);
  const loadedCount = useCountUp(dashboardStats.loaded);
  const validCount = useCountUp(dashboardStats.validated);
  const observedCount = useCountUp(dashboardStats.observed);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="dashboard-period" className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">
          Periodo academico
        </label>
        <select
          id="dashboard-period"
          value={activePeriodId}
          onChange={event => onChangePeriod(event.target.value)}
          className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {periods.map(period => (
            <option key={period.id} value={period.id}>{period.label}</option>
          ))}
        </select>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <motion.div variants={fadeInUp} className="premium-card bg-white p-5 rounded-lg border-l-4 border-l-[#2563eb] space-y-2">
          <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest leading-none">Total Evidencias</span>
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

      <div className="premium-card bg-white p-5 rounded-lg border border-[#e2e8f0]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-slate-500" />
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Verificaciones presenciales</h3>
              <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest mt-1">
                Se registran en la visita in situ · No suman al progreso documental
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <span className="text-[#15803d]">{presentialStats.verified} verificadas</span>
            <span className="text-[#dc2626]">{presentialStats.observed} con observaciones</span>
            <span className="text-[#d97706]">{presentialStats.pending} pendientes</span>
            <span className="text-[#64748b]">de {presentialStats.total}</span>
          </div>
        </div>
        <div className="mt-4 w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div className="h-full bg-[#22c55e] rounded-full transition-all" style={{ width: `${presentialProgress}%` }} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">
            CRITERIOS
          </h3>
        </div>
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2"
        >
          {mockData[0].criteria.map((crit, index) => (
            <motion.button
              variants={fadeInUp}
              whileHover={hoverCardLift}
              type="button"
              key={crit.id} 
              onClick={() => onOpenCriterionSubCriteria(mockData[0].year, crit.id)}
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
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {pendingIndicators.length} de {allIndicators.length} indicadores
            </span>
          </div>
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="divide-y divide-slate-50"
          >
            {pendingIndicators.length === 0 && (
              <p className="p-6 text-sm font-bold text-slate-400">
                Todas las evidencias documentales de este periodo tienen un archivo vigente sin observaciones.
              </p>
            )}
            {pendingIndicators.slice(0, 5).map(({ indicator: ind, missing, toCorrect, progress }) => (
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
                     <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                       {progress}% documental · {missing.length} sin archivo{toCorrect.length > 0 ? ` · ${toCorrect.length} por corregir` : ''}
                     </p>
                     <div className="flex flex-wrap gap-2 mt-1">
                       {toCorrect.slice(0, 1).map(r => (
                         <span key={`c-${r.id}`} className="max-w-[260px] truncate text-[9px] font-bold text-[#dc2626] uppercase bg-red-50 px-1.5 py-0.5 rounded italic">Corregir: {r.label}</span>
                       ))}
                       {missing.slice(0, 2 - Math.min(1, toCorrect.length)).map(r => (
                         <span key={r.id} className="max-w-[260px] truncate text-[9px] font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded italic">Falta: {r.label}</span>
                       ))}
                     </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-all" />
              </motion.div>
            ))}
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
