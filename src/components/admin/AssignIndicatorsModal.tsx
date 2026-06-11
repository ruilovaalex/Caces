import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Check } from 'lucide-react';
import { MOCK_DATA } from '../../data/cacesMockData';

interface AssignIndicatorsModalProps {
  isOpen: boolean;
  coordinatorName: string;
  initialAssignedCodes: string[];
  onClose: () => void;
  onSave: (assignedCodes: string[]) => void;
}

export const AssignIndicatorsModal = ({
  isOpen,
  coordinatorName,
  initialAssignedCodes,
  onClose,
  onSave,
}: AssignIndicatorsModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set(initialAssignedCodes));

  const allIndicators = useMemo(() => {
    const list: { code: string; name: string }[] = [];
    MOCK_DATA.forEach(year => {
      year.criteria.forEach(crit => {
        crit.subCriteria.forEach(sub => {
          sub.indicators.forEach(ind => {
            list.push({ code: ind.code, name: ind.name });
          });
        });
      });
    });
    return list;
  }, []);

  const filteredIndicators = allIndicators.filter(
    ind =>
      ind.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (code: string) => {
    const next = new Set(selectedCodes);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    setSelectedCodes(next);
  };

  const selectAll = () => {
    const next = new Set(selectedCodes);
    filteredIndicators.forEach(ind => next.add(ind.code));
    setSelectedCodes(next);
  };

  const deselectAll = () => {
    const next = new Set(selectedCodes);
    filteredIndicators.forEach(ind => next.delete(ind.code));
    setSelectedCodes(next);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Asignar Indicadores</h2>
              <p className="text-sm text-slate-500">Coordinador: {coordinatorName}</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={selectAll} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Seleccionar filtrados</button>
              <button onClick={deselectAll} className="text-xs font-semibold text-slate-500 hover:text-slate-700">Deseleccionar filtrados</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredIndicators.map((ind) => (
                <div
                  key={ind.code}
                  onClick={() => toggleSelection(ind.code)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCodes.has(ind.code) ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${
                    selectedCodes.has(ind.code) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedCodes.has(ind.code) && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">{ind.code}</span>
                    <span className="text-xs text-slate-600 line-clamp-2">{ind.name}</span>
                  </div>
                </div>
              ))}
              {filteredIndicators.length === 0 && (
                <p className="text-sm text-center text-slate-500 py-8">No se encontraron indicadores</p>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(Array.from(selectedCodes))}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Guardar ({selectedCodes.size} seleccionados)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
