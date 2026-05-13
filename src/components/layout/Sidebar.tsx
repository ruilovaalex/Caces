import React from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  LayoutDashboard
} from 'lucide-react';
import { Indicator, YearPeriod, UserRole } from '../../types';

interface SidebarProps {
  mockData: YearPeriod[];
  selectedIndicator: Indicator | null;
  expandedNodes: Set<string>;
  focusedNodeId: string | null;
  userRole: UserRole;
  onIndicatorSelect: (ind: Indicator) => void;
  onDashboardClick: () => void;
  onToggleNode: (id: string) => void;
  onSetFocusedNode: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSwitchRole: (role: UserRole) => void;
}

export const Sidebar = ({
  mockData,
  selectedIndicator,
  expandedNodes,
  focusedNodeId,
  userRole,
  onIndicatorSelect,
  onDashboardClick,
  onToggleNode,
  onSetFocusedNode,
  onKeyDown,
  onSwitchRole
}: SidebarProps) => {
  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded shadow-lg shadow-blue-600/20">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-slate-800 leading-none">CACES</h1>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Acreditación</span>
        </div>
      </div>

      <nav 
        className="flex-1 overflow-y-auto p-4 space-y-1 outline-none"
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-label="Explorador de indicadores"
      >
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4 flex items-center justify-between">
          <span>Gestión de Periodos</span>
          <button 
            onClick={onDashboardClick}
            className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-all"
            title="Ir al Dashboard Global"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {mockData.map((yearPeriod) => (
          <div key={yearPeriod.year} className="space-y-1">
            <button 
              onClick={() => { onToggleNode(yearPeriod.year.toString()); onSetFocusedNode(yearPeriod.year.toString()); }}
              className={`w-full flex items-center gap-2 px-2 py-2 hover:bg-slate-50 rounded-md transition-colors text-sm font-semibold text-slate-700 outline-none ${focusedNodeId === yearPeriod.year.toString() ? 'bg-slate-100 ring-1 ring-slate-200' : ''}`}
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
                      className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-md transition-colors text-xs font-bold text-slate-500 uppercase tracking-wide truncate text-left outline-none ${focusedNodeId === `crit-${crit.id}` ? 'bg-slate-100 ring-1 ring-slate-200' : ''}`}
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
                              className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-md transition-colors text-[11px] font-semibold text-slate-400 text-left outline-none ${focusedNodeId === `sub-${sub.id}` ? 'bg-slate-100 ring-1 ring-slate-200' : ''}`}
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
                                      : (focusedNodeId === `ind-${indicator.code}` ? 'bg-slate-100 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')
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

      <div 
        className="p-4 border-t border-slate-100 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => {
          const roles: UserRole[] = ['ADMIN', 'COORDINADOR', 'EVALUADOR'];
          const next = roles[(roles.indexOf(userRole) + 1) % roles.length];
          onSwitchRole(next);
        }}
      >
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-xs ring-4 ring-white shadow-lg ${
            userRole === 'ADMIN' ? 'bg-slate-900' : userRole === 'COORDINADOR' ? 'bg-blue-600' : 'bg-emerald-600'
          }`}>
            {userRole === 'ADMIN' ? 'PM' : userRole === 'COORDINADOR' ? 'CO' : 'EV'}
          </div>
          <div className="text-[10px]">
            <p className="font-bold text-slate-700 leading-tight">
              {userRole === 'ADMIN' ? 'Admin Sudamericano' : userRole === 'COORDINADOR' ? 'Coord. Académico' : 'Evaluador Externo'}
            </p>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[8px] mt-0.5">{userRole} (Clic para cambiar)</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
