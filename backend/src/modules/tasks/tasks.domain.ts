import { Actor } from '../../shared/domain/actor';
import { ForbiddenError, ValidationError } from '../../shared/domain/errors';

export type TaskStatus = 'NUEVA' | 'EN_PROGRESO' | 'ENTREGADA';
export const TASK_STATUSES: readonly TaskStatus[] = ['NUEVA', 'EN_PROGRESO', 'ENTREGADA'];

export interface TeacherTask {
  id: string;
  periodCode: string;
  assigneeId: string;
  assigneeName: string;
  createdByName: string;
  indicatorCode: string;
  title: string;
  evidenceLabel: string;
  dueDate: string; // AAAA-MM-DD
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewTask {
  periodId: string;
  assigneeId: string;
  createdById: string;
  indicatorId: string;
  title: string;
  evidenceLabel: string;
  dueDate: string;
}

export interface TaskRepository {
  list(periodCode: string, assigneeId?: string): Promise<TeacherTask[]>;
  findById(id: string): Promise<TeacherTask | null>;
  create(data: NewTask): Promise<TeacherTask>;
  updateStatus(id: string, status: TaskStatus): Promise<TeacherTask>;
  delete(id: string): Promise<void>;
  listTeachers(): Promise<{ id: string; name: string; email: string }[]>;
  findActiveTeacher(id: string): Promise<{ id: string; name: string } | null>;
}

export const TASK_REPOSITORY = Symbol('TaskRepository');

export const TaskPolicy = {
  assertCanManage(actor: Actor) {
    if (actor.role !== 'COORDINADOR') throw new ForbiddenError('Solo el coordinador asigna y elimina tareas');
  },
  assertCanList(actor: Actor) {
    if (actor.role === 'EVALUADOR') throw new ForbiddenError('El evaluador no accede a las tareas docentes');
  },
  // El docente solo avanza sus propias tareas (NUEVA -> EN_PROGRESO -> ENTREGADA); el coordinador puede corregir cualquier estado.
  assertCanChangeStatus(actor: Actor, task: TeacherTask, next: TaskStatus) {
    if (actor.role === 'COORDINADOR') return;
    if (actor.role !== 'DOCENTE' || task.assigneeId !== actor.id) throw new ForbiddenError('No puedes cambiar esta tarea');
    const step = TASK_STATUSES.indexOf(next) - TASK_STATUSES.indexOf(task.status);
    if (step !== 1) throw new ValidationError('El docente solo puede avanzar la tarea al siguiente estado');
  },
};

export const assertTaskInput = (input: { title: string; evidenceLabel: string; dueDate: string }) => {
  if (!input.title.trim()) throw new ValidationError('El título de la tarea es obligatorio');
  if (!input.evidenceLabel.trim()) throw new ValidationError('Indica la evidencia que debe entregar el docente');
  if (Number.isNaN(Date.parse(`${input.dueDate}T00:00:00Z`))) throw new ValidationError('Fecha límite inválida');
};
