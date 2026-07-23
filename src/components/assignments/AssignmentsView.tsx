import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Link2,
  Plus,
  Send,
  Shield,
  Smartphone,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react';
import { WorkflowGuide } from '../layout/WorkflowGuide';
import {
  Assignment,
  AssignmentMode,
  CoordinatorProfile,
  IndicatorCoordinatorAssignment,
  UserRole,
  YearPeriod
} from '../../types';
import { useAssignments } from '../../hooks/useAssignments';
import { CoordinatorAssignmentService } from '../../services/coordinatorAssignmentService';
import { FormField, fieldClassName } from '../common/FormField';
import { Button } from '../common/Button';
import { PageHeader } from '../common/PageHeader';
import { useToast } from '../common/Toast';

interface AssignmentsViewProps {
  userRole: UserRole;
  mockData: YearPeriod[];
  currentUserName?: string;
  onAssignmentsChange?: () => void;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  area: string;
  mobileStatus: 'Conectado' | 'Pendiente';
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

const roleDescriptions: Record<UserRole, string> = {
  ADMIN: 'Supervisa el sistema y mantiene la base local de roles en esta fase.',
  COORDINADOR: 'Crea docentes, indicadores, evidencias y tareas.',
  EVALUADOR: 'Revisa, observa, rechaza o valida evidencias.',
  DOCENTE: 'Prepara y entrega los soportes documentales asignados.'
};

export const AssignmentsView = ({
  userRole,
  mockData,
  currentUserName = 'Admin local',
  onAssignmentsChange
}: AssignmentsViewProps) => {
  const { showToast } = useToast();
  const { assignments, createAssignment } = useAssignments();
  const [roles, setRoles] = useState<UserRole[]>(['ADMIN', 'COORDINADOR', 'EVALUADOR', 'DOCENTE']);
  const [newRole, setNewRole] = useState('');
  const [coordinators, setCoordinators] = useState<CoordinatorProfile[]>(() => CoordinatorAssignmentService.getCoordinators());
  const [indicatorAssignments, setIndicatorAssignments] = useState<IndicatorCoordinatorAssignment[]>(() => CoordinatorAssignmentService.getAssignments());
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState('coord-1');
  const [selectedAssignmentIndicatorCode, setSelectedAssignmentIndicatorCode] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherArea, setTeacherArea] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(initialTeachers[0]?.id || '');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>(initialTeachers[0] ? [initialTeachers[0].id] : []);
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>('SINGLE');
  const [selectedIndicatorCode, setSelectedIndicatorCode] = useState('1.1.1');
  const [selectedRequirementId, setSelectedRequirementId] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskNote, setTaskNote] = useState('');
  const [dueDate, setDueDate] = useState('');

  const indicators = useMemo(
    () => mockData.flatMap(period =>
      period.criteria.flatMap(criterion =>
        criterion.subCriteria.flatMap(subCriterion => subCriterion.indicators)
      )
    ),
    [mockData]
  );

  const periodOptions = useMemo(() => {
    const years = Array.from(new Set(mockData.map(period => period.year)));
    const visibleYears = years.length ? years : [new Date().getFullYear()];

    return visibleYears.flatMap(year => [
      { id: `${year}-periodo-1`, label: `${year} - Periodo 1` },
      { id: `${year}-periodo-2`, label: `${year} - Periodo 2` }
    ]);
  }, [mockData]);

  const selectedIndicator = useMemo(
    () => indicators.find(indicator => indicator.code === selectedIndicatorCode) || indicators[0],
    [indicators, selectedIndicatorCode]
  );

  const selectedRequirement = useMemo(
    () => selectedIndicator?.requirements.find(requirement => requirement.id === selectedRequirementId) || selectedIndicator?.requirements[0],
    [selectedIndicator, selectedRequirementId]
  );

  const selectedPeriod = useMemo(
    () => periodOptions.find(period => period.id === selectedPeriodId) || periodOptions[0],
    [periodOptions, selectedPeriodId]
  );

  useEffect(() => {
    if (indicators[0] && !indicators.some(indicator => indicator.code === selectedIndicatorCode)) {
      setSelectedIndicatorCode(indicators[0].code);
    }
  }, [indicators, selectedIndicatorCode]);

  useEffect(() => {
    if (!indicators[0]) return;
    if (indicators.some(indicator => indicator.code === selectedAssignmentIndicatorCode)) return;
    setSelectedAssignmentIndicatorCode(indicators[0].code);
  }, [indicators, selectedAssignmentIndicatorCode]);

  useEffect(() => {
    if (!selectedIndicator) return;
    if (selectedIndicator.requirements.some(requirement => requirement.id === selectedRequirementId)) return;
    setSelectedRequirementId(selectedIndicator.requirements[0]?.id || '');
  }, [selectedIndicator, selectedRequirementId]);

  useEffect(() => {
    if (selectedPeriodId || !periodOptions[0]) return;
    setSelectedPeriodId(periodOptions[0].id);
  }, [periodOptions, selectedPeriodId]);

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
    if (!teacherName.trim() || !teacherEmail.trim()) {
      showToast('Completa el nombre y correo del docente.', 'error');
      return;
    }

    const teacher: Teacher = {
      id: crypto.randomUUID(),
      name: teacherName.trim(),
      email: teacherEmail.trim(),
      area: teacherArea.trim() || 'Sin area asignada',
      mobileStatus: 'Pendiente'
    };

    setTeachers([teacher, ...teachers]);
    setSelectedTeacherId(teacher.id);
    setSelectedTeacherIds(previous => [teacher.id, ...previous]);
    setTeacherName('');
    setTeacherEmail('');
    setTeacherArea('');
    showToast('Docente creado correctamente.');
  };

  const refreshIndicatorAssignments = () => {
    setCoordinators(CoordinatorAssignmentService.getCoordinators());
    setIndicatorAssignments(CoordinatorAssignmentService.getAssignments());
    onAssignmentsChange?.();
  };

  const effectiveAssignmentIndicatorCode = selectedAssignmentIndicatorCode || indicators[0]?.code || '';

  const currentCoordinatorAssignments = indicatorAssignments.filter(
    assignment => assignment.coordinatorId === selectedCoordinatorId
  );

  const isSelectedIndicatorAlreadyAssigned = currentCoordinatorAssignments.some(
    assignment => assignment.indicatorCode === effectiveAssignmentIndicatorCode
  );

  const handleAssignIndicator = () => {
    const coordinator = coordinators.find(item => item.id === selectedCoordinatorId);
    const indicator = indicators.find(item => item.code === effectiveAssignmentIndicatorCode);
    if (!coordinator || !indicator) return;
    if (isSelectedIndicatorAlreadyAssigned) {
      refreshIndicatorAssignments();
      return;
    }

    CoordinatorAssignmentService.assignIndicator({
      coordinatorId: coordinator.id,
      coordinatorName: coordinator.name,
      indicatorCode: indicator.code,
      indicatorName: indicator.name,
      createdBy: currentUserName
    });
    refreshIndicatorAssignments();
    showToast('Indicador asignado correctamente.');
  };

  const handleRemoveIndicatorAssignment = (assignmentId: string) => {
    CoordinatorAssignmentService.removeAssignment(assignmentId);
    refreshIndicatorAssignments();
    showToast('Asignación eliminada.');
  };

  const toggleTeacherSelection = (teacherId: string) => {
    setSelectedTeacherIds(previous =>
      previous.includes(teacherId)
        ? previous.filter(id => id !== teacherId)
        : [...previous, teacherId]
    );
  };

  const getAssignedTeachers = () => {
    if (assignmentMode === 'ALL') return teachers;
    if (assignmentMode === 'MULTIPLE') {
      return teachers.filter(teacher => selectedTeacherIds.includes(teacher.id));
    }
    return teachers.filter(teacher => teacher.id === selectedTeacherId);
  };

  const handleCreateTask = () => {
    const assignedTeachers = getAssignedTeachers();
    if (!assignedTeachers.length || !taskTitle.trim() || !selectedIndicator || !selectedRequirement || !selectedPeriod || !dueDate) {
      showToast('Completa los datos obligatorios y selecciona al menos un docente.', 'error');
      return;
    }

    const task: Assignment = {
      id: crypto.randomUUID(),
      title: taskTitle.trim(),
      periodId: selectedPeriod.id,
      periodLabel: selectedPeriod.label,
      indicatorCode: selectedIndicator.code,
      requirementId: selectedRequirement.id,
      requirementLabel: selectedRequirement.label,
      assignedTeacherIds: assignedTeachers.map(teacher => teacher.id),
      assignedTeacherNames: assignedTeachers.map(teacher => teacher.name),
      assignmentMode,
      dueDate,
      state: 'CREAR',
      note: taskNote.trim() || undefined
    };

    createAssignment(task);
    setTaskTitle('');
    setTaskNote('');
    setDueDate('');
    showToast('Tarea guardada localmente.');
  };

  if (userRole === 'ADMIN') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader title="Administración local" description="Gestiona coordinadores, roles y asignaciones del prototipo." breadcrumbs={['Inicio', 'Coordinadores y tareas']} />
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

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-700 border border-blue-100">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">Asignar indicadores a coordinadores</h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                Asignacion local del prototipo. No modifica la matriz CACES base.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.5fr_auto]">
            <select
              value={selectedCoordinatorId}
              onChange={event => setSelectedCoordinatorId(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:bg-white"
            >
              {coordinators.map(coordinator => (
                <option key={coordinator.id} value={coordinator.id}>
                  {coordinator.name}
                </option>
              ))}
            </select>

            <select
              value={effectiveAssignmentIndicatorCode}
              onChange={event => setSelectedAssignmentIndicatorCode(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:bg-white"
            >
              {indicators.map(indicator => (
                <option key={indicator.code} value={indicator.code}>
                  {indicator.code} - {indicator.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAssignIndicator}
              disabled={!effectiveAssignmentIndicatorCode || isSelectedIndicatorAlreadyAssigned}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-xs font-black uppercase tracking-widest text-white ${
                isSelectedIndicatorAlreadyAssigned
                  ? 'cursor-not-allowed bg-slate-400'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Plus className="h-4 w-4" />
              {isSelectedIndicatorAlreadyAssigned ? 'Ya asignado' : 'Asignar'}
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Asignaciones actuales
              </p>
              <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-100">
                {currentCoordinatorAssignments.length} indicadores
              </span>
            </div>

            <div className="space-y-2">
              {currentCoordinatorAssignments.map(assignment => (
                <div key={assignment.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                  <div>
                    <p className="text-sm font-black text-slate-800">{assignment.indicatorCode} - {assignment.indicatorName}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Coordinador: {assignment.coordinatorName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveIndicatorAssignment(assignment.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    aria-label={`Quitar indicador ${assignment.indicatorCode}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {!currentCoordinatorAssignments.length && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-xs font-bold text-slate-400">
                  Este coordinador no tiene indicadores asignados. Como fallback seguro, vera toda la matriz al entrar como coordinador.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Docentes y tareas" description="Crea docentes y distribuye tareas asociadas a las evidencias." breadcrumbs={['Inicio', 'Docentes y tareas']} />
      <WorkflowGuide activeStep="assignments" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Crear docente</h3>
          </div>

          <div className="mt-5 space-y-3">
            <FormField label="Nombre del docente" required><input value={teacherName} onChange={event => setTeacherName(event.target.value)} className={fieldClassName} /></FormField>
            <FormField label="Correo institucional" required><input type="email" value={teacherEmail} onChange={event => setTeacherEmail(event.target.value)} className={fieldClassName} /></FormField>
            <FormField label="Área o carrera"><input value={teacherArea} onChange={event => setTeacherArea(event.target.value)} className={fieldClassName} /></FormField>
            <Button onClick={handleCreateTeacher} icon={<Plus className="h-4 w-4" />} className="w-full">Crear docente</Button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Crear tarea para docente</h3>
          </div>

          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'SINGLE', label: 'Un docente' },
                { value: 'MULTIPLE', label: 'Varios' },
                { value: 'ALL', label: 'Todos' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAssignmentMode(option.value as AssignmentMode)}
                  className={`rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${assignmentMode === option.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {assignmentMode === 'SINGLE' && (
              <select value={selectedTeacherId} onChange={event => setSelectedTeacherId(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-300 focus:bg-white">
                {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
              </select>
            )}

            {assignmentMode === 'MULTIPLE' && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Docentes asignados</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {teachers.map(teacher => (
                    <label key={teacher.id} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-bold text-slate-600 border border-slate-100">
                      <input
                        type="checkbox"
                        checked={selectedTeacherIds.includes(teacher.id)}
                        onChange={() => toggleTeacherSelection(teacher.id)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      {teacher.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {assignmentMode === 'ALL' && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                Se asignara a los {teachers.length} docentes registrados actualmente en esta vista.
              </div>
            )}

            <select aria-label="Período académico" value={selectedPeriodId} onChange={event => setSelectedPeriodId(event.target.value)} className={fieldClassName}>
              {periodOptions.map(period => <option key={period.id} value={period.id}>{period.label}</option>)}
            </select>
            <select aria-label="Indicador" value={selectedIndicatorCode} onChange={event => setSelectedIndicatorCode(event.target.value)} className={fieldClassName}>
              {indicators.map(indicator => <option key={indicator.code} value={indicator.code}>{indicator.code} - {indicator.name}</option>)}
            </select>
            <select aria-label="Evidencia" value={selectedRequirementId} onChange={event => setSelectedRequirementId(event.target.value)} className={fieldClassName}>
              {selectedIndicator?.requirements.map(requirement => <option key={requirement.id} value={requirement.id}>{requirement.label}</option>)}
            </select>
            <FormField label="Nombre de la tarea" required><input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} className={fieldClassName} /></FormField>
            <FormField label="Nota para el docente"><textarea value={taskNote} onChange={event => setTaskNote(event.target.value)} rows={3} className={fieldClassName} /></FormField>
            <FormField label="Fecha de entrega" required><input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} className={fieldClassName} /></FormField>
            <Button onClick={handleCreateTask} icon={<Smartphone className="h-4 w-4" />} className="w-full">Guardar tarea local</Button>
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
            {assignments.map(task => (
              <div key={task.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-800">{task.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {task.assignedTeacherNames.join(', ')} - Indicador {task.indicatorCode} - {task.requirementLabel}
                </p>
                <p className="mt-1 text-xs text-slate-500">{task.periodLabel}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                    Entrega {task.dueDate}
                  </span>
                  <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                    {task.state}
                  </span>
                  <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-100">
                    Apoyo para prototipo movil
                  </span>
                </div>
              </div>
            ))}
            {!assignments.length && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-xs font-bold text-slate-400">
                Todavia no hay tareas guardadas en este navegador.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
