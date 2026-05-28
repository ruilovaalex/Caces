import React from 'react';
import {
  ChevronRight,
  FileText,
  Folder,
  ClipboardList
} from 'lucide-react';
import { Indicator, YearPeriod, UserRole } from '../../types';

interface SidebarProps {
  mockData: YearPeriod[];
  selectedIndicator: Indicator | null;
  expandedNodes: Set<string>;
  focusedNodeId: string | null;
  userRole: UserRole;
  activeView: 'dashboard' | 'checklist' | 'assignments' | 'indicator';
  onIndicatorSelect: (ind: Indicator) => void;
  onToggleNode: (id: string) => void;
  onSetFocusedNode: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenDashboard: () => void;
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
  onOpenAssignments
}: SidebarProps) => {
  const roleNames: Record<UserRole, string> = {
    ADMIN: 'Admin Sudamericano',
    COORDINADOR: 'Coord. Academico',
    EVALUADOR: 'Evaluador Externo'
  };

  const roleInitials: Record<UserRole, string> = {
    ADMIN: 'AD',
    COORDINADOR: 'CO',
    EVALUADOR: 'EV'
  };

  return (
    <aside className="w-80 bg-white border-r border-[#e2e8f0] flex flex-col shadow-sm">
      <div className="h-16 border-b border-white/10 flex items-center gap-3 bg-[#1e2d4a] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563eb] shadow-lg shadow-blue-600/20">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white leading-none">CACES</h1>
          <span className="text-[9px] text-[#aac4e8] font-bold uppercase tracking-[0.2em]">Acreditacion</span>
        </div>
      </div>

      <div className="p-4 border-b border-[#e2e8f0] space-y-2">
        {userRole !== 'ADMIN' && (
          <button
            onClick={onOpenDashboard}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
              activeView === 'dashboard' || activeView === 'indicator' || activeView === 'checklist'
                ? 'bg-[#2563eb] text-white'
                : 'text-[#64748b] hover:bg-[#f4f6f9]'
            }`}
          >
            <Folder className="w-4 h-4" />
            1. Repositorio
          </button>
        )}

        {(userRole === 'ADMIN' || userRole === 'COORDINADOR') && (
          <button
            onClick={onOpenAssignments}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
              activeView === 'assignments'
                ? 'bg-[#2563eb] text-white'
                : 'text-[#64748b] hover:bg-[#f4f6f9]'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            {userRole === 'ADMIN' ? '1. Roles' : '2. Docentes y tareas'}
          </button>
        )}
      </div>

      {userRole !== 'ADMIN' ? (
      <nav
        className="flex-1 overflow-y-auto p-4 space-y-1 outline-none"
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-label="Explorador de indicadores"
      >
        <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest px-2 mb-4">
          Gestion de periodos
        </div>

        {mockData.map((yearPeriod) => (
          <div key={yearPeriod.year} className="space-y-1">
            <button
              onClick={() => { onToggleNode(yearPeriod.year.toString()); onSetFocusedNode(yearPeriod.year.toString()); }}
              className={`w-full flex items-center gap-2 px-2 py-2 hover:bg-[#f4f6f9] rounded-md transition-colors text-sm font-semibold text-[#1e293b] outline-none ${focusedNodeId === yearPeriod.year.toString() ? 'bg-[#dbeafe] ring-1 ring-blue-100' : ''}`}
            >
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedNodes.has(yearPeriod.year.toString()) ? 'rotate-90' : ''}`} />
              <Folder className="w-4 h-4 text-amber-500/70" />
              Año {yearPeriod.year}
            </button>

            {expandedNodes.has(yearPeriod.year.toString()) && (
              <div className="ml-4 space-y-1 border-l border-slate-200 pl-2">
                {yearPeriod.criteria.map((crit) => (
                  <div key={crit.id}>
                    <button
                      onClick={() => { onToggleNode(`crit-${crit.id}`); onSetFocusedNode(`crit-${crit.id}`); }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-[#f4f6f9] rounded-md transition-colors text-xs font-bold text-[#64748b] uppercase tracking-wide truncate text-left outline-none ${focusedNodeId === `crit-${crit.id}` ? 'bg-[#dbeafe] ring-1 ring-blue-100' : ''}`}
                    >
                      <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${expandedNodes.has(`crit-${crit.id}`) ? 'rotate-90' : ''}`} />
                      <Folder className="w-4 h-4 text-blue-600/70 shrink-0" />
                      <span className="truncate">{crit.name}</span>
                    </button>

                    {expandedNodes.has(`crit-${crit.id}`) && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-slate-100 pl-2">
                        {crit.subCriteria.map((sub) => (
                          <div key={sub.id}>
                            <button
                              onClick={() => { onToggleNode(`sub-${sub.id}`); onSetFocusedNode(`sub-${sub.id}`); }}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-[#f4f6f9] rounded-md transition-colors text-[11px] font-semibold text-[#64748b] text-left outline-none ${focusedNodeId === `sub-${sub.id}` ? 'bg-[#dbeafe] ring-1 ring-blue-100' : ''}`}
                            >
                              <ChevronRight className={`w-2.5 h-2.5 text-slate-300 transition-transform ${expandedNodes.has(`sub-${sub.id}`) ? 'rotate-90' : ''}`} />
                              <Folder className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
                              <span className="truncate">{sub.name}</span>
                            </button>

                            {expandedNodes.has(`sub-${sub.id}`) && (
                              <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-50 pl-2">
                                {sub.indicators.map((indicator) => (
                                  <button
                                    key={indicator.code}
                                    onClick={() => onIndicatorSelect(indicator)}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded transition-all text-[11px] font-medium leading-tight text-left outline-none ${
                                      selectedIndicator?.code === indicator.code
                                        ? 'tree-item-active shadow-sm'
                                        : (focusedNodeId === `ind-${indicator.code}` ? 'bg-[#dbeafe] ring-1 ring-blue-100' : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f4f6f9]')
                                    }`}
                                  >
                                    <FileText className="w-3 h-3 text-slate-300 shrink-0" />
                                    <span className="flex-1 truncate">
                                      {indicator.code} {indicator.name}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      ) : (
        <div className="flex-1 p-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Administrador</p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-slate-700">
              Perfil limitado a crear roles. La gestion de docentes, indicadores y evidencias queda a cargo del coordinador.
            </p>
          </div>
        </div>
      )}

      <div
        className="p-4 border-t border-[#e2e8f0] bg-[#f4f6f9] cursor-pointer hover:bg-white transition-colors"
        onClick={() => {
          const roles: UserRole[] = ['ADMIN', 'COORDINADOR', 'EVALUADOR'];
          const next = roles[(roles.indexOf(userRole) + 1) % roles.length];
          onSwitchRole(next);
        }}
      >
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-xs ring-4 ring-white shadow-lg ${
            userRole === 'ADMIN' ? 'bg-[#1e2d4a]' : userRole === 'COORDINADOR' ? 'bg-[#2563eb]' : 'bg-[#15803d]'
          }`}>
            {roleInitials[userRole]}
          </div>
          <div className="text-[10px]">
            <p className="font-bold text-[#1e293b] leading-tight">{roleNames[userRole]}</p>
            <p className="text-[#64748b] font-black uppercase tracking-widest text-[8px] mt-0.5">{userRole} (clic para cambiar)</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
