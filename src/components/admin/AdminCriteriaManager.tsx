import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Edit2, Plus, Trash2, X, Save } from 'lucide-react';
import { MOCK_DATA } from '../../data/cacesMockData';
import { Indicator, Requirement, YearPeriod } from '../../types';

export const AdminCriteriaManager = () => {
  const [data, setData] = useState<YearPeriod[]>([]);
  const [editingItem, setEditingItem] = useState<{ type: 'criterion' | 'subcriterion' | 'indicator' | 'requirement', item: any, parentIndicator?: Indicator } | null>(null);
  
  // Custom structure form fields
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editFormats, setEditFormats] = useState<string[]>([]);
  
  const FORMAT_OPTIONS = ['PDF', 'DOCX', 'XLSX', 'JPG', 'PNG', 'MP4'];

  useEffect(() => {
    const saved = localStorage.getItem('edusudamericano_custom_structure_v1');
    if (saved) {
      // In a real app we'd deep merge. For simplicity, if custom structure exists, we use it.
      // But let's start by initializing from MOCK_DATA if nothing is saved.
      setData(JSON.parse(saved));
    } else {
      setData(MOCK_DATA);
    }
  }, []);

  const handleSaveAll = () => {
    localStorage.setItem('edusudamericano_custom_structure_v1', JSON.stringify(data));
    alert('Estructura guardada exitosamente.');
  };

  const handleEditClick = (type: any, item: any, parentIndicator?: Indicator) => {
    setEditingItem({ type, item, parentIndicator });
    setEditName(item.name || item.label || '');
    setEditDesc(item.description || '');
    if (type === 'requirement') {
      setEditFormats(item.allowedFormats || []);
    }
  };

  const saveEdit = () => {
    if (!editingItem) return;

    const newData = [...data];
    // Deep search and update - simplified for this component
    // We modify the object in place because it's a deep copy conceptually if we do it right,
    // but in React we should clone deeply. For now, mutating newData and setting it.
    
    const updateRecursive = (items: any[]) => {
      for (const it of items) {
        if (it.id === editingItem.item.id || it.code === editingItem.item.code) {
          if (editingItem.type === 'requirement') {
            it.label = editName;
            it.description = editDesc;
            it.allowedFormats = editFormats;
          } else {
            it.name = editName;
            if (it.description !== undefined) it.description = editDesc;
          }
          return true;
        }
        
        if (it.criteria && updateRecursive(it.criteria)) return true;
        if (it.subCriteria && updateRecursive(it.subCriteria)) return true;
        if (it.indicators && updateRecursive(it.indicators)) return true;
        if (it.requirements && updateRecursive(it.requirements)) return true;
      }
      return false;
    };

    updateRecursive(newData);
    setData(newData);
    setEditingItem(null);
  };

  const toggleFormat = (fmt: string) => {
    setEditFormats(prev => prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Criterios e Indicadores</h1>
            <p className="text-slate-500">Modifica la estructura CACES, agrega requerimientos y define formatos.</p>
          </div>
        </div>
        <button onClick={handleSaveAll} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
          <Save className="w-4 h-4" /> Guardar Cambios
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto max-h-[600px]">
        {data.map(year => (
          <div key={year.year} className="mb-6">
            <h2 className="text-xl font-bold border-b pb-2 mb-4">Año {year.year}</h2>
            {year.criteria.map(crit => (
              <div key={crit.id} className="ml-4 mb-4 border-l-2 border-slate-200 pl-4">
                <div className="flex items-center gap-2 mb-2 group">
                  <h3 className="text-lg font-semibold text-slate-800">{crit.name}</h3>
                  <button onClick={() => handleEditClick('criterion', crit)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                </div>
                
                {crit.subCriteria.map(sub => (
                  <div key={sub.id} className="ml-4 mb-4 border-l-2 border-slate-200 pl-4">
                    <div className="flex items-center gap-2 mb-2 group">
                      <h4 className="font-semibold text-slate-700">{sub.name}</h4>
                      <button onClick={() => handleEditClick('subcriterion', sub)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    </div>

                    {sub.indicators.map(ind => (
                      <div key={ind.code} className="ml-4 mb-4 border-l-2 border-blue-200 pl-4 bg-blue-50/30 p-2 rounded">
                        <div className="flex items-center gap-2 group">
                          <span className="font-bold text-blue-800">{ind.code}</span>
                          <span className="font-medium">{ind.name}</span>
                          <button onClick={() => handleEditClick('indicator', ind)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 mb-2">{ind.description}</p>
                        
                        <div className="ml-4 space-y-2 mt-2">
                          {ind.requirements.map(req => (
                            <div key={req.id} className="flex items-start justify-between bg-white p-2 border rounded shadow-sm group">
                              <div>
                                <p className="text-sm font-semibold">{req.label}</p>
                                <p className="text-xs text-slate-500">{req.description}</p>
                                <div className="flex gap-1 mt-1">
                                  {(req.allowedFormats || []).map(f => (
                                    <span key={f} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{f}</span>
                                  ))}
                                </div>
                              </div>
                              <button onClick={() => handleEditClick('requirement', req, ind)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold">Editar {editingItem.type}</h2>
              <button onClick={() => setEditingItem(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre / Título</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              {(editingItem.type === 'indicator' || editingItem.type === 'requirement') && (
                <div>
                  <label className="block text-sm font-semibold mb-1">Descripción</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24" />
                </div>
              )}

              {editingItem.type === 'requirement' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Formatos Permitidos</label>
                  <div className="flex flex-wrap gap-2">
                    {FORMAT_OPTIONS.map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => toggleFormat(fmt)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          editFormats.includes(fmt) ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg">Cancelar</button>
              <button onClick={saveEdit} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
