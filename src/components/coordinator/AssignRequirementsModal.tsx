import React, { useState, useEffect } from 'react';
import { X, Search, CheckSquare } from 'lucide-react';
import { MOCK_DATA } from '../../data/cacesMockData';
import { TeacherAssignment } from '../../types/coordinator.types';

interface AssignRequirementsModalProps {
  isOpen: boolean;
  teacherName: string;
  coordinatorId: string;
  initialAssignments: TeacherAssignment[];
  onClose: () => void;
  onSave: (assignments: TeacherAssignment[]) => void;
}

export const AssignRequirementsModal = ({
  isOpen,
  teacherName,
  coordinatorId,
  initialAssignments,
  onClose,
  onSave
}: AssignRequirementsModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState<TeacherAssignment[]>(initialAssignments);
  const [coordinatorIndicators, setCoordinatorIndicators] = useState<string[]>([]);

  useEffect(() => {
    const savedAssignments = localStorage.getItem('edusudamericano_indicator_assignments_v1');
    if (savedAssignments) {
      const map = JSON.parse(savedAssignments);
      if (map[coordinatorId]) {
        setCoordinatorIndicators(map[coordinatorId]);
      }
    } else {
      // Si no hay asignaciones pero el coordinador es coord-1, damos unos de prueba
      if (coordinatorId === 'coord-1') {
        setCoordinatorIndicators(['1.1.1', '1.1.2', '2.1.1']);
      }
    }
  }, [coordinatorId]);

  if (!isOpen) return null;

  // Filtrar los requerimientos de los indicadores asignados al coordinador
  const availableReqs = MOCK_DATA.flatMap(year => 
    year.criteria.flatMap(c => 
      c.subCriteria.flatMap(s => 
        s.indicators
          .filter(ind => coordinatorIndicators.includes(ind.code))
          .flatMap(ind => 
            ind.requirements.map(req => ({
              indicatorCode: ind.code,
              indicatorName: ind.name,
              reqId: req.id,
              reqLabel: req.label
            }))
          )
      )
    )
  );

  const filteredReqs = availableReqs.filter(req => 
    req.indicatorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.reqLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAssigned = (indCode: string, reqId: string) => {
    return assignments.some(a => a.indicatorCode === indCode && a.requirementId === reqId);
  };

  const toggleAssignment = (indCode: string, reqId: string) => {
    if (isAssigned(indCode, reqId)) {
      setAssignments(assignments.filter(a => !(a.indicatorCode === indCode && a.requirementId === reqId)));
    } else {
      setAssignments([...assignments, { indicatorCode: indCode, requirementId: reqId }]);
    }
  };

  const handleSave = () => {
    onSave(assignments);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Asignar Requerimientos</h2>
            <p className="text-xs text-slate-500 mt-1">Docente: <span className="font-bold text-slate-700">{teacherName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código de indicador o requerimiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {coordinatorIndicators.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No tienes indicadores CACES asignados a tu cargo. Contacta al administrador.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredReqs.map(req => (
                <label 
                  key={`${req.indicatorCode}-${req.reqId}`} 
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                    isAssigned(req.indicatorCode, req.reqId) ? 'bg-teal-50 border-teal-200' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      checked={isAssigned(req.indicatorCode, req.reqId)}
                      onChange={() => toggleAssignment(req.indicatorCode, req.reqId)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-teal-700">Ind. {req.indicatorCode}</p>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{req.reqLabel}</p>
                  </div>
                </label>
              ))}
              {filteredReqs.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No se encontraron requerimientos.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500">
            <span className="text-teal-600 font-bold">{assignments.length}</span> seleccionados
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
            >
              <CheckSquare className="w-4 h-4" />
              Guardar Asignaciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
