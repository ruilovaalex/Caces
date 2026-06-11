import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit3, UserPlus } from 'lucide-react';
import { Teacher } from '../../types/coordinator.types';
import { AssignRequirementsModal } from './AssignRequirementsModal';

export const CoordinatorTeachersPanel = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  // We assume the current user is a coordinator with id 'coord-1' based on useAuth
  const currentCoordinatorId = 'coord-1';

  useEffect(() => {
    const saved = localStorage.getItem('edusudamericano_coordinator_teachers_v1');
    if (saved) {
      setTeachers(JSON.parse(saved));
    }
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newTeacher: Teacher = {
      id: `docente-${Date.now()}`,
      name: newName,
      email: newEmail,
      specialty: newSpecialty,
      coordinatorId: currentCoordinatorId,
      assignments: []
    };

    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem('edusudamericano_coordinator_teachers_v1', JSON.stringify(updated));
    setNewName('');
    setNewEmail('');
    setNewSpecialty('');
  };

  const handleSaveAssignments = (assignments: { indicatorCode: string; requirementId: string }[]) => {
    if (!selectedTeacher) return;
    const updated = teachers.map(t =>
      t.id === selectedTeacher.id ? { ...t, assignments } : t
    );
    setTeachers(updated);
    localStorage.setItem('edusudamericano_coordinator_teachers_v1', JSON.stringify(updated));
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  const myTeachers = teachers.filter(t => t.coordinatorId === currentCoordinatorId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis Docentes</h1>
          <p className="text-slate-500">Agrega docentes a tu equipo y asígnales requerimientos específicos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-bold text-slate-800 mb-4">Nuevo Docente</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Ej. Ing. Pablo Mora"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="docente@edu.ec"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Especialidad (Opcional)</label>
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Ej. Docente Investigador"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Agregar Docente
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-600">Docente</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Requerimientos Asignados</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {myTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{teacher.name}</p>
                      <p className="text-xs text-slate-500">{teacher.email}</p>
                      {teacher.specialty && <p className="text-[10px] uppercase text-teal-600 font-bold mt-1">{teacher.specialty}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                        {teacher.assignments?.length || 0} asignados
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Asignar
                      </button>
                    </td>
                  </tr>
                ))}
                {myTeachers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No tienes docentes en tu equipo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && selectedTeacher && (
        <AssignRequirementsModal
          isOpen={isModalOpen}
          teacherName={selectedTeacher.name}
          initialAssignments={selectedTeacher.assignments || []}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTeacher(null);
          }}
          onSave={handleSaveAssignments}
          coordinatorId={currentCoordinatorId}
        />
      )}
    </div>
  );
};
