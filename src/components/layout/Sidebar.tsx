import React from 'react';
import {
  CalendarRange,
  ChevronRight,
  ClipboardList,
  FilePlus2,
  FileText,
  Folder,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Indicator, UserRole, YearPeriod } from '../../types';
import { getAcademicPeriodsForYear } from '../../utils/academicPeriodUtils';
import { fadeInRight, slideDown, staggerContainerFast } from '../../utils/animations';

interface SidebarProps {
  mockData: YearPeriod[];
  selectedIndicator: Indicator | null;
  expandedNodes: Set<string>;
  focusedNodeId: string | null;
  userRole: UserRole;
  activeView: 'dashboard' | 'checklist' | 'assignments' | 'templates' | 'indicator';
  onIndicatorSelect: (ind: Indicator) => void;
  onToggleNode: (id: string) => void;
  onSetFocusedNode: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenDashboard: () => void;
  onOpenTemplates: () => void;
  onOpenAssignments: () => void;
}

export const Sidebar = ({
  mockData,
  selectedIndicator,
  expandedNodes,
  focusedNodeId,
  userRole,
  activeView,
  onIndicatorSelect,
  onToggleNode,
  onSetFocusedNode,
  onKeyDown,
  onSwitchRole,
  onOpenDashboard,
  onOpenTemplates,
  onOpenAssignments,
}: SidebarProps) => {
  const isRepositoryActive =
    activeView === 'dashboard' || activeView === 'indicator' || activeView === 'checklist';
  const isTemplatesActive = activeView === 'templates';
  const isAssignmentsActive = activeView === 'assignments';

  const roleNames: Record<UserRole, string> = {
    ADMIN: 'Admin Sudamericano',
    COORDINADOR: 'Coord. Academico',
    EVALUADOR: 'Evaluador Externo',
    DOCENTE: 'Prof. Pablo Mora',
  };

  const roleInitials: Record<UserRole, string> = {
    ADMIN: 'AD',
    COORDINADOR: 'CO',
    EVALUADOR: 'EV',
    DOCENTE: 'DO',
  };

  const activeButtonStyles =
    'relative bg-[#eff6ff] text-[#1d4ed8] border-[#2563eb] shadow-lg shadow-blue-600/10 ring-2 ring-blue-200/70';
  const inactiveButtonStyles =
    'text-[#475569] border-transparent hover:bg-[#f4f6f9]';

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-80 bg-white border-r border-[#e2e8f0] flex flex-col shadow-sm"
    >
      <div className="h-16 border-b border-white/10 flex items-center gap-3 bg-[#1e2d4a] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563eb] shadow-lg shadow-blue-600/20">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white leading-none">CACES</h1>
          <span className="text-[9px] text-[#aac4e8] font-bold uppercase tracking-[0.2em]">Acreditacion</span>
        </div>
      </div>

      <motion.div
        variants={staggerContainerFast}
        initial="initial"
        animate="animate"
        className="p-4 border-b border-[#e2e8f0] space-y-2"
      >
        {(userRole === 'ADMIN' || userRole === 'COORDINADOR' || userRole === 'EVALUADOR') && (
          <motion.button
            variants={fadeInRight}
            whileHover={
              isRepositoryActive
                ? { x: 4, boxShadow: '0 10px 24px rgba(37, 99, 235, 0.22)' }
                : { x: 4, backgroundColor: 'rgba(244, 246, 249, 1)' }
            }
            onClick={onOpenDashboard}
            aria-current={isRepositoryActive ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
              isRepositoryActive
                ? activeButtonStyles
                : inactiveButtonStyles
            }`}
          >
            {isRepositoryActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-[#2563eb]" />
            )}
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              isRepositoryActive ? 'bg-[#2563eb] text-white shadow-sm shadow-blue-600/20' : 'bg-slate-100 text-slate-500'
            }`}>
              <Folder className="w-4 h-4" />
            </span>
            <span className="flex-1 text-left">1. Repositorio</span>
            {isRepositoryActive && (
              <span className="rounded-full bg-[#2563eb] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white">
                Actual
              </span>
            )}
          </motion.button>
        )}

        {userRole === 'COORDINADOR' && (
          <motion.button
            variants={fadeInRight}
            whileHover={
              isTemplatesActive
                ? { x: 4, boxShadow: '0 10px 24px rgba(37, 99, 235, 0.22)' }
                : { x: 4, backgroundColor: 'rgba(244, 246, 249, 1)' }
            }
            onClick={onOpenTemplates}
            aria-current={isTemplatesActive ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
              isTemplatesActive
                ? activeButtonStyles
                : inactiveButtonStyles
            }`}
          >
            {isTemplatesActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-[#2563eb]" />
            )}
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              isTemplatesActive ? 'bg-[#2563eb] text-white shadow-sm shadow-blue-600/20' : 'bg-slate-100 text-slate-500'
            }`}>
              <FilePlus2 className="w-4 h-4" />
            </span>
            <span className="flex-1 text-left">2. Crear</span>
            {isTemplatesActive && (
              <span className="rounded-full bg-[#2563eb] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white">
                Actual
              </span>
            )}
          </motion.button>
        )}

        {(userRole === 'ADMIN' || userRole === 'COORDINADOR') && (
          <motion.button
            variants={fadeInRight}
            whileHover={
              isAssignmentsActive
                ? { x: 4, boxShadow: '0 10px 24px rgba(37, 99, 235, 0.22)' }
                : { x: 4, backgroundColor: 'rgba(244, 246, 249, 1)' }
            }
            onClick={onOpenAssignments}
            aria-current={isAssignmentsActive ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
              isAssignmentsActive
                ? activeButtonStyles
                : inactiveButtonStyles
            }`}
          >
            {isAssignmentsActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-[#2563eb]" />
            )}
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              isAssignmentsActive ? 'bg-[#2563eb] text-white shadow-sm shadow-blue-600/20' : 'bg-slate-100 text-slate-500'
            }`}>
              <ClipboardList className="w-4 h-4" />
            </span>
            <span className="flex-1 text-left">{userRole === 'ADMIN' ? '3. Roles' : '3. Docentes y tareas'}</span>
            {isAssignmentsActive && (
              <span className="rounded-full bg-[#2563eb] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white">
                Actual
              </span>
            )}
          </motion.button>
        )}
      </motion.div>

      {userRole === 'ADMIN' || userRole === 'COORDINADOR' || userRole === 'EVALUADOR' ? (
        <nav
          className="flex-1 overflow-y-auto p-4 space-y-1 outline-none"
          onKeyDown={onKeyDown}
          tabIndex={0}
          aria-label="Explorador de indicadores"
        >
          <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest px-2 mb-4">
            Gestion de periodos
          </div>

          {mockData.map((yearPeriod) => {
            const yearId = yearPeriod.year.toString();

            return (
              <div key={yearId} className="space-y-1">
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    onToggleNode(yearId);
                    onSetFocusedNode(yearId);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-2 hover:bg-[#f4f6f9] rounded-md transition-colors text-sm font-semibold text-[#1e293b] outline-none ${
                    focusedNodeId === yearId ? 'bg-[#dbeafe] ring-1 ring-blue-100' : ''
                  }`}
                >
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedNodes.has(yearId) ? 'rotate-90' : ''}`} />
                  <Folder className="w-4 h-4 text-amber-500/70" />
                  <span>{`A\u00f1o ${yearPeriod.year}`}</span>
                </motion.button>

                <AnimatePresence>
                  {expandedNodes.has(yearId) && (
                    <motion.div
                      variants={slideDown}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="ml-4 space-y-1 border-l border-slate-200 pl-2 origin-top"
                    >
                      {getAcademicPeriodsForYear(yearPeriod.year).map((period) => (
                        <div key={period.id}>
                          <motion.button
                            whileHover={{ x: 4 }}
                            onClick={() => {
                              onToggleNode(period.id);
                              onSetFocusedNode(period.id);
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-[#f4f6f9] rounded-md transition-colors text-xs font-bold text-[#475569] text-left outline-none ${
                              focusedNodeId === period.id ? 'bg-[#dbeafe] ring-1 ring-blue-100' : ''
                            }`}
                          >
                            <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${expandedNodes.has(period.id) ? 'rotate-90' : ''}`} />
                            <CalendarRange className="w-4 h-4 text-emerald-600/70 shrink-0" />
                            <span className="truncate">{period.label}</span>
                          </motion.button>

                          <AnimatePresence>
                            {expandedNodes.has(period.id) && (
                              <motion.div
                                variants={slideDown}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="ml-4 mt-1 space-y-1 border-l border-slate-100 pl-2 origin-top"
                              >
                                {yearPeriod.criteria.map((crit) => {
                                  const criterionNodeId = `${period.id}-crit-${crit.id}`;

                                  return (
                                    <div key={criterionNodeId}>
                                      <motion.button
                                        whileHover={{ x: 4 }}
                                        onClick={() => {
                                          onToggleNode(criterionNodeId);
                                          onSetFocusedNode(criterionNodeId);
                                        }}
                                        className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-[#f4f6f9] rounded-md transition-colors text-xs font-bold text-[#64748b] uppercase tracking-wide truncate text-left outline-none ${
                                          focusedNodeId === criterionNodeId ? 'bg-[#dbeafe] ring-1 ring-blue-100' : ''
                                        }`}
                                      >
                                        <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${expandedNodes.has(criterionNodeId) ? 'rotate-90' : ''}`} />
                                        <Folder className="w-4 h-4 text-blue-600/70 shrink-0" />
                                        <span className="truncate">{crit.name}</span>
                                      </motion.button>

                                      <AnimatePresence>
                                        {expandedNodes.has(criterionNodeId) && (
                                          <motion.div
                                            variants={slideDown}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            className="ml-4 mt-1 space-y-1 border-l border-slate-100 pl-2 origin-top"
                                          >
                                            {crit.subCriteria.map((sub) => {
                                              const subCriterionNodeId = `${period.id}-sub-${sub.id}`;

                                              return (
                                                <div key={subCriterionNodeId}>
                                                  <motion.button
                                                    whileHover={{ x: 4 }}
                                                    onClick={() => {
                                                      onToggleNode(subCriterionNodeId);
                                                      onSetFocusedNode(subCriterionNodeId);
                                                    }}
                                                    className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-[#f4f6f9] rounded-md transition-colors text-[11px] font-semibold text-[#64748b] text-left outline-none ${
                                                      focusedNodeId === subCriterionNodeId ? 'bg-[#dbeafe] ring-1 ring-blue-100' : ''
                                                    }`}
                                                  >
                                                    <ChevronRight className={`w-2.5 h-2.5 text-slate-300 transition-transform ${expandedNodes.has(subCriterionNodeId) ? 'rotate-90' : ''}`} />
                                                    <Folder className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
                                                    <span className="truncate">{sub.name}</span>
                                                  </motion.button>

                                                  <AnimatePresence>
                                                    {expandedNodes.has(subCriterionNodeId) && (
                                                      <motion.div
                                                        variants={slideDown}
                                                        initial="initial"
                                                        animate="animate"
                                                        exit="exit"
                                                        className="ml-5 mt-1 space-y-0.5 border-l border-slate-50 pl-2 origin-top"
                                                      >
                                                        {sub.indicators.map((indicator) => {
                                                          const indicatorNodeId = `${period.id}-ind-${indicator.code}`;

                                                          return (
                                                            <motion.button
                                                              whileHover={{ x: 4 }}
                                                              key={indicatorNodeId}
                                                              onClick={() => {
                                                                onSetFocusedNode(indicatorNodeId);
                                                                onIndicatorSelect(indicator);
                                                              }}
                                                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded transition-all text-[11px] font-medium leading-tight text-left outline-none ${
                                                                selectedIndicator?.code === indicator.code
                                                                  ? 'tree-item-active shadow-sm'
                                                                  : focusedNodeId === indicatorNodeId
                                                                    ? 'bg-[#dbeafe] ring-1 ring-blue-100'
                                                                    : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f4f6f9]'
                                                              }`}
                                                            >
                                                              <FileText className="w-3 h-3 text-slate-300 shrink-0" />
                                                              <span className="flex-1 truncate">
                                                                {indicator.code} {indicator.name}
                                                              </span>
                                                            </motion.button>
                                                          );
                                                        })}
                                                      </motion.div>
                                                    )}
                                                  </AnimatePresence>
                                                </div>
                                              );
                                            })}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      ) : userRole === 'DOCENTE' ? (
        <div className="flex-1 p-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Docente Adjunto</p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-slate-700">
              Navega por tus actividades y archivos usando el menu superior.
            </p>
          </div>
        </div>
      ) : null}

      <motion.div
        whileTap={{ scale: 0.98 }}
        className="p-4 border-t border-[#e2e8f0] bg-[#f4f6f9] cursor-pointer hover:bg-white transition-colors"
        onClick={() => {
          const roles: UserRole[] = ['ADMIN', 'COORDINADOR', 'EVALUADOR', 'DOCENTE'];
          const next = roles[(roles.indexOf(userRole) + 1) % roles.length];
          onSwitchRole(next);
        }}
      >
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-xs ring-4 ring-white shadow-lg ${
            userRole === 'ADMIN' ? 'bg-[#1e2d4a]' : userRole === 'COORDINADOR' ? 'bg-[#2563eb]' : userRole === 'DOCENTE' ? 'bg-[#d97706]' : 'bg-[#15803d]'
          }`}>
            {roleInitials[userRole]}
          </div>
          <div className="text-[10px]">
            <p className="font-bold text-[#1e293b] leading-tight">{roleNames[userRole]}</p>
            <p className="text-[#64748b] font-black uppercase tracking-widest text-[8px] mt-0.5">{userRole} (clic para cambiar)</p>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
};
