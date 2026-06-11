import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  Plus,
  Send,
  Shield,
  Smartphone,
  UserPlus,
  Users
} from 'lucide-react';
import { WorkflowGuide } from '../layout/WorkflowGuide';
import { UserRole, YearPeriod } from '../../types';

interface AssignmentsViewProps {
  userRole: UserRole;
  mockData: YearPeriod[];
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  area: string;
  mobileStatus: 'Conectado' | 'Pendiente';
}

interface TeacherTask {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  indicatorCode: string;
  evidenceLabel: string;
  dueDate: string;
  status: 'Nueva' | 'En progreso' | 'Entregada';
}

const initialTeachers: Teacher[] = [
  {
    id: 'doc-1',
    name: 'Carlos Mendoza',
    email: 'docente1@edusudamericano.edu.ec',
    area: 'Planificacion institucional',
    mobileStatus: 'Conectado'
  },
  {
    id: 'doc-2',
    name: 'Maria Torres',
    email: 'maria.torres@edusudamericano.edu.ec',
    area: 'Vinculacion',
    mobileStatus: 'Pendiente'
  }
];

const initialTasks: TeacherTask[] = [
  {
    id: 'task-1',
    teacherId: 'doc-1',
    teacherName: 'Carlos Mendoza',
    title: 'Preparar respaldo documental del PEDI',
    indicatorCode: '1.1.1',
    evidenceLabel: 'PEDI aprobado y vigente',
    dueDate: '2026-06-05',
    status: 'Nueva'
  }
];

const roleDescriptions: Record<UserRole, string> = {
  ADMIN: 'Supervisa el sistema y mantiene la base local de roles en esta fase.',
  COORDINADOR: 'Crea docentes, indicadores, evidencias y tareas.',
  EVALUADOR: 'Revisa, observa, rechaza o valida evidencias.',
  DOCENTE: 'Prepara y entrega los soportes documentales asignados.'
};

export const AssignmentsView = ({ userRole, mockData }: AssignmentsViewProps) => {
  const [roles, setRoles] = useState<UserRole[]>(['ADMIN', 'COORDINADOR', 'EVALUADOR', 'DOCENTE']);
  const [newRole, setNewRole] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [tasks, setTasks] = useState<TeacherTask[]>(initialTasks);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherArea, setTeacherArea] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(initialTeachers[0]?.id || '');
  const [selectedIndicatorCode, setSelectedIndicatorCode] = useState('1.1.1');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskEvidence, setTaskEvidence] = useState('');
  const [dueDate, setDueDate] = useState('');

  const indicators = useMemo(
    () => mockData.flatMap(period =>
      period.criteria.flatMap(criterion =>
        criterion.subCriteria.flatMap(subCriterion => subCriterion.indicators)
      )
    ),
    [mockData]
  );

  if (userRole !== 'ADMIN' && userRole !== 'COORDINADOR') {
    return null;
  }

  const handleAddRole = () => {
    const normalized = newRole.trim().toUpperCase().replace(/\s+/g, '_') as UserRole;
    if (!normalized || roles.includes(normalized)) return;
    setRoles([...roles, normalized]);
    setNewRole('');
  };

  const handleCreateTeacher = () => {
    if (!teacherName.trim() || !teacherEmail.trim()) return;

    const teacher: Teacher = {
      id: crypto.randomUUID(),
      name: teacherName.trim(),
      email: teacherEmail.trim(),
      area: teacherArea.trim() || 'Sin area asignada',
      mobileStatus: 'Pendiente'
    };

    setTeachers([teacher, ...teachers]);
    setSelectedTeacherId(teacher.id);
    setTeacherName('');
    setTeacherEmail('');
    setTeacherArea('');
  };

  const handleCreateTask = () => {
    const teacher = teachers.find(item => item.id === selectedTeacherId);
    if (!teacher || !taskTitle.trim() || !taskEvidence.trim() || !dueDate) return;

    const task: TeacherTask = {
      id: crypto.randomUUID(),
      teacherId: teacher.id,
      teacherName: teacher.name,
      title: taskTitle.trim(),
      indicatorCode: selectedIndicatorCode,
      evidenceLabel: taskEvidence.trim(),
      dueDate,
      status: 'Nueva'
    };

    setTasks([task, ...tasks]);
    setTaskTitle('');
    setTaskEvidence('');
    setDueDate('');
  };

  if (userRole === 'ADMIN') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <WorkflowGuide activeStep="assignments" />

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-900 p-3 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Administracion local del sistema</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                Base de supervision del prototipo. La edicion de criterios, indicadores y evidencias CACES sigue desactivada.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={newRole}
              onChange={event => setNewRole(event.target.value)}
              placeholder="Nuevo rol, ejemplo: SECRETARIA_ACADEMICA"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:bg-white"
            />
            <button
              onClick={handleAddRole}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Registrar rol local
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {roles.map(role => (
              <div key={role} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-800">{role}</p>
                <p className="mt-1 text-xs text-slate-500">{roleDescriptions[role] || 'Rol personalizado pendiente de permisos en backend.'}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <WorkflowGuide activeStep="assignments" />

      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700 border border-emerald-100">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Docentes y tareas</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
            El coordinador crea docentes, indicadores, evidencias y tareas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Crear docente</h3>
          </div>

          <div className="mt-5 space-y-3">
            <input value={teacherName} onChange={event => setTeacherName(event.target.value)} placeholder="Nombre del docente" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white" />
            <input value={teacherEmail} onChange={event => setTeacherEmail(event.target.value)} placeholder="Correo institucional" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white" />
            <input value={teacherArea} onChange={event => setTeacherArea(event.target.value)} placeholder="Area o carrera" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white" />
            <button onClick={handleCreateTeacher} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Crear docente
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Crear tarea para docente</h3>
          </div>

          <div className="mt-5 space-y-3">
            <select value={selectedTeacherId} onChange={event => setSelectedTeacherId(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white">
              {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
            </select>
            <select value={selectedIndicatorCode} onChange={event => setSelectedIndicatorCode(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white">
              {indicators.map(indicator => <option key={indicator.code} value={indicator.code}>{indicator.code} - {indicator.name}</option>)}
            </select>
            <input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="Titulo de la tarea" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white" />
            <input value={taskEvidence} onChange={event => setTaskEvidence(event.target.value)} placeholder="Evidencia solicitada" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white" />
            <input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white" />
            <button onClick={handleCreateTask} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-700">
              <Smartphone className="h-4 w-4" />
              Publicar para app movil
            </button>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Docentes registrados</h3>
          </div>
          <div className="space-y-3">
            {teachers.map(teacher => (
              <div key={teacher.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-800">{teacher.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{teacher.email} - {teacher.area}</p>
                  </div>
                  <span className={`rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${teacher.mobileStatus === 'Conectado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {teacher.mobileStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Tareas enviadas</h3>
          </div>
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-800">{task.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {task.teacherName} - Indicador {task.indicatorCode} - {task.evidenceLabel}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                    Entrega {task.dueDate}
                  </span>
                  <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-100">
                    Visible en movil
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
