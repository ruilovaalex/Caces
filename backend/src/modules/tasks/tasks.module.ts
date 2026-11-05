import { Body, Controller, Delete, Get, HttpCode, Inject, Injectable, Module, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { AUDIT_LOG, AuditLog } from '../../shared/application/audit.port';
import { NOTIFIER, Notifier } from '../../shared/application/notifier.port';
import { Actor } from '../../shared/domain/actor';
import { NotFoundError, ValidationError } from '../../shared/domain/errors';
import { CurrentActor } from '../../shared/http/auth';
import { PrismaService } from '../../shared/infrastructure/prisma.service';
import { resolveIndicator, resolvePeriod, resolveWritablePeriod } from '../catalog/application/resolve';
import { CatalogModule } from '../catalog/catalog.module';
import { CATALOG_LOOKUP, CatalogLookup } from '../catalog/domain/catalog';
import { assertTaskInput, NewTask, TASK_REPOSITORY, TASK_STATUSES, TaskPolicy, TaskRepository, TaskStatus, TeacherTask } from './tasks.domain';

const taskSelect = {
  id: true,
  assigneeId: true,
  title: true,
  evidenceLabel: true,
  dueDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  period: { select: { code: true } },
  assignee: { select: { name: true } },
  createdBy: { select: { name: true } },
  indicator: { select: { code: true } },
} as const;

type Row = {
  id: string;
  assigneeId: string;
  title: string;
  evidenceLabel: string;
  dueDate: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  period: { code: string };
  assignee: { name: string };
  createdBy: { name: string };
  indicator: { code: string };
};

const toTask = (row: Row): TeacherTask => ({
  id: row.id,
  periodCode: row.period.code,
  assigneeId: row.assigneeId,
  assigneeName: row.assignee.name,
  createdByName: row.createdBy.name,
  indicatorCode: row.indicator.code,
  title: row.title,
  evidenceLabel: row.evidenceLabel,
  dueDate: row.dueDate.toISOString().slice(0, 10),
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(periodCode: string, assigneeId?: string) {
    const rows = await this.prisma.teacherTask.findMany({
      where: { period: { code: periodCode }, ...(assigneeId ? { assigneeId } : {}) },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      select: taskSelect,
    });
    return rows.map(toTask);
  }

  async findById(id: string) {
    const row = await this.prisma.teacherTask.findUnique({ where: { id }, select: taskSelect });
    return row ? toTask(row) : null;
  }

  async create(data: NewTask) {
    const row = await this.prisma.teacherTask.create({
      data: { ...data, title: data.title.trim(), evidenceLabel: data.evidenceLabel.trim(), dueDate: new Date(`${data.dueDate}T00:00:00Z`) },
      select: taskSelect,
    });
    return toTask(row);
  }

  async updateStatus(id: string, status: TaskStatus) {
    return toTask(await this.prisma.teacherTask.update({ where: { id }, data: { status }, select: taskSelect }));
  }

  async delete(id: string) {
    await this.prisma.teacherTask.delete({ where: { id } });
  }

  listTeachers() {
    return this.prisma.user.findMany({
      where: { role: 'DOCENTE', active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
    });
  }

  findActiveTeacher(id: string) {
    return this.prisma.user.findFirst({ where: { id, role: 'DOCENTE', active: true }, select: { id: true, name: true } });
  }
}

@Injectable()
export class TaskUseCases {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository,
    @Inject(CATALOG_LOOKUP) private readonly catalog: CatalogLookup,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
    @Inject(AUDIT_LOG) private readonly audit: AuditLog,
  ) {}

  async list(actor: Actor, periodCode: string) {
    TaskPolicy.assertCanList(actor);
    await resolvePeriod(this.catalog, periodCode);
    // Un docente solo ve las tareas asignadas a el.
    return this.tasks.list(periodCode, actor.role === 'DOCENTE' ? actor.id : undefined);
  }

  listTeachers(actor: Actor) {
    TaskPolicy.assertCanManage(actor);
    return this.tasks.listTeachers();
  }

  async create(
    actor: Actor,
    input: { periodCode: string; assigneeId: string; indicatorCode: string; title: string; evidenceLabel: string; dueDate: string },
  ) {
    TaskPolicy.assertCanManage(actor);
    assertTaskInput(input);
    const period = await resolveWritablePeriod(this.catalog, input.periodCode);
    const indicator = await resolveIndicator(this.catalog, input.indicatorCode);
    const teacher = await this.tasks.findActiveTeacher(input.assigneeId);
    if (!teacher) throw new ValidationError('El destinatario debe ser un docente activo');
    const task = await this.tasks.create({
      periodId: period.id,
      assigneeId: teacher.id,
      createdById: actor.id,
      indicatorId: indicator.id,
      title: input.title,
      evidenceLabel: input.evidenceLabel,
      dueDate: input.dueDate,
    });
    await this.notifier.toUsers([teacher.id], {
      title: 'Nueva tarea asignada',
      message: `${actor.name} te asigno: ${task.title} (indicador ${task.indicatorCode}), vence el ${task.dueDate}.`,
      type: 'INFO',
    });
    await this.audit.record({ actorId: actor.id, action: 'TASK_CREATED', entityType: 'TeacherTask', entityId: task.id, periodId: period.id });
    return task;
  }

  async changeStatus(actor: Actor, id: string, next: TaskStatus) {
    const task = await this.tasks.findById(id);
    if (!task) throw new NotFoundError('Tarea no encontrada');
    TaskPolicy.assertCanChangeStatus(actor, task, next);
    const updated = await this.tasks.updateStatus(id, next);
    if (next === 'ENTREGADA' && actor.role === 'DOCENTE') {
      await this.notifier.toRoles(['COORDINADOR'], {
        title: 'Tarea entregada',
        message: `${actor.name} marco como entregada: ${task.title} (indicador ${task.indicatorCode}).`,
        type: 'SUCCESS',
      });
    }
    await this.audit.record({ actorId: actor.id, action: 'TASK_STATUS_CHANGED', entityType: 'TeacherTask', entityId: id, metadata: { from: task.status, to: next } });
    return updated;
  }

  async remove(actor: Actor, id: string) {
    TaskPolicy.assertCanManage(actor);
    if (!(await this.tasks.findById(id))) throw new NotFoundError('Tarea no encontrada');
    await this.tasks.delete(id);
    await this.audit.record({ actorId: actor.id, action: 'TASK_DELETED', entityType: 'TeacherTask', entityId: id });
  }
}

class CreateTaskDto {
  @ApiProperty() @IsUUID() assigneeId: string;
  @ApiProperty({ example: '1.1.1' }) @Matches(/^\d\.\d\.\d$/) indicatorCode: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(200) title: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(300) evidenceLabel: string;
  @ApiProperty({ example: '2026-06-05' }) @Matches(/^\d{4}-\d{2}-\d{2}$/) dueDate: string;
}

class ChangeStatusDto {
  @ApiProperty({ enum: TASK_STATUSES }) @IsIn(TASK_STATUSES) status: TaskStatus;
}

@ApiTags('tasks')
@ApiBearerAuth()
@Controller()
class TasksController {
  constructor(private readonly useCases: TaskUseCases) {}

  @Get('teachers')
  teachers(@CurrentActor() actor: Actor) {
    return this.useCases.listTeachers(actor);
  }

  @Get('periods/:periodCode/tasks')
  list(@CurrentActor() actor: Actor, @Param('periodCode') periodCode: string) {
    return this.useCases.list(actor, periodCode);
  }

  @Post('periods/:periodCode/tasks')
  create(@CurrentActor() actor: Actor, @Param('periodCode') periodCode: string, @Body() body: CreateTaskDto) {
    return this.useCases.create(actor, { periodCode, ...body });
  }

  @Patch('tasks/:id/status')
  changeStatus(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string, @Body() body: ChangeStatusDto) {
    return this.useCases.changeStatus(actor, id, body.status);
  }

  @Delete('tasks/:id')
  @HttpCode(204)
  remove(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.useCases.remove(actor, id);
  }
}

@Module({
  imports: [CatalogModule],
  controllers: [TasksController],
  providers: [TaskUseCases, { provide: TASK_REPOSITORY, useClass: PrismaTaskRepository }],
})
export class TasksModule {}
