import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit3 } from 'lucide-react';
import { Coordinator } from '../../types/coordinator.types';
import { AssignIndicatorsModal } from './AssignIndicatorsModal';

export const AdminCoordinatorsPanel = () => {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState<Coordinator | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('edusudamericano_coordinators_v1');
    if (saved) {
      setCoordinators(JSON.parse(saved));
    } else {
      // Valor por defecto temporal si no hay ninguno
      const defaultCoord: Coordinator = {
        id: 'coord-1',
        name: 'Coord. Academico',
        email: 'coordinador@edusudamericano.edu.ec',
        assignedIndicators: []
      };
      setCoordinators([defaultCoord]);
      localStorage.setItem('edusudamericano_coordinators_v1', JSON.stringify([defaultCoord]));
    }
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newCoord: Coordinator = {
      id: `coord-${Date.now()}`,
      name: newName,
      email: newEmail,
      assignedIndicators: []
    };

    const updated = [...coordinators, newCoord];
    setCoordinators(updated);
    localStorage.setItem('edusudamericano_coordinators_v1', JSON.stringify(updated));
    setNewName('');
    setNewEmail('');
  };

  const handleSaveIndicators = (assignedCodes: string[]) => {
    if (!selectedCoordinator) return;
    const updated = coordinators.map(c =>
      c.id === selectedCoordinator.id ? { ...c, assignedIndicators: assignedCodes } : c
    );
    setCoordinators(updated);
    localStorage.setItem('edusudamericano_coordinators_v1', JSON.stringify(updated));
    
    // El documento dice que guardemos en edusudamericano_indicator_assignments_v1
    // Para facilitar el consumo posterior, guardaremos un mapa { coordId: string[] }
    const assignmentsMap = updated.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.assignedIndicators }), {});
    localStorage.setItem('edusudamericano_indicator_assignments_v1', JSON.stringify(assignmentsMap));

    setIsModalOpen(false);
    setSelectedCoordinator(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Coordinadores</h1>
          <p className="text-slate-500">Crea coordinadores y asígnales indicadores CACES.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-bold text-slate-800 mb-4">Nuevo Coordinador</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. Ing. Juan Pérez"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="juan@edusudamericano.edu.ec"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Crear Coordinador
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-600">Nombre</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Indicadores Asignados</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {coordinators.map((coord) => (
                  <tr key={coord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{coord.name}</p>
                      <p className="text-xs text-slate-500">{coord.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {coord.assignedIndicators.length} asignados
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCoordinator(coord);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Asignar
                      </button>
                    </td>
                  </tr>
                ))}
                {coordinators.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No hay coordinadores registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && selectedCoordinator && (
        <AssignIndicatorsModal
          isOpen={isModalOpen}
          coordinatorName={selectedCoordinator.name}
          initialAssignedCodes={selectedCoordinator.assignedIndicators}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCoordinator(null);
          }}
          onSave={handleSaveIndicators}
        />
      )}
    </div>
  );
};
