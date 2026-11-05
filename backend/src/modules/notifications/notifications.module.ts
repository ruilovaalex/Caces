import { Controller, Delete, Get, Global, HttpCode, Injectable, Module, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { normalizePage, Page, PageRequest } from '../../shared/application/pagination';
import { NOTIFIER, Notifier, OutgoingNotification } from '../../shared/application/notifier.port';
import { Actor, Role } from '../../shared/domain/actor';
import { CurrentActor } from '../../shared/http/auth';
import { PrismaService } from '../../shared/infrastructure/prisma.service';
import { MyNotificationsUseCases, NOTIFICATION_REPOSITORY, NotificationRepository, UserNotification } from './notifications';

@Injectable()
class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listForRecipient(recipientId: string, { page, pageSize }: PageRequest): Promise<Page<UserNotification> & { unread: number }> {
    const [items, total, unread] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { recipientId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where: { recipientId } }),
      this.prisma.notification.count({ where: { recipientId, readAt: null } }),
    ]);
    return { items, total, unread, page, pageSize };
  }

  findById(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async markRead(id: string, at: Date) {
    await this.prisma.notification.updateMany({ where: { id, readAt: null }, data: { readAt: at } });
  }

  async markAllRead(recipientId: string, at: Date) {
    return (await this.prisma.notification.updateMany({ where: { recipientId, readAt: null }, data: { readAt: at } })).count;
  }

  async delete(id: string) {
    await this.prisma.notification.delete({ where: { id } });
  }

  async deleteAllForRecipient(recipientId: string) {
    return (await this.prisma.notification.deleteMany({ where: { recipientId } })).count;
  }
}

@Injectable()
class PrismaNotifier implements Notifier {
  constructor(private readonly prisma: PrismaService) {}

  async toUsers(userIds: string[], notification: OutgoingNotification) {
    const unique = [...new Set(userIds)];
    if (!unique.length) return;
    await this.prisma.notification.createMany({ data: unique.map(recipientId => ({ recipientId, ...notification })) });
  }

  async toRoles(roles: Role[], notification: OutgoingNotification, options?: { excludeUserId?: string }) {
    const recipients = await this.prisma.user.findMany({
      where: { role: { in: roles }, active: true, ...(options?.excludeUserId ? { id: { not: options.excludeUserId } } : {}) },
      select: { id: true },
    });
    await this.toUsers(recipients.map(user => user.id), notification);
  }
}

class PageQueryDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
}

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
class NotificationsController {
  constructor(private readonly useCases: MyNotificationsUseCases) {}

  @Get()
  list(@CurrentActor() actor: Actor, @Query() query: PageQueryDto) {
    return this.useCases.list(actor, normalizePage(query.page, query.pageSize));
  }

  @Post('read-all')
  @HttpCode(200)
  async readAll(@CurrentActor() actor: Actor) {
    return { updated: await this.useCases.markAllRead(actor) };
  }

  @Post(':id/read')
  @HttpCode(204)
  async read(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    await this.useCases.markRead(actor, id);
  }

  @Delete()
  @HttpCode(200)
  async deleteAll(@CurrentActor() actor: Actor) {
    return { deleted: await this.useCases.deleteAll(actor) };
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    await this.useCases.delete(actor, id);
  }
}

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [
    MyNotificationsUseCases,
    { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
    { provide: NOTIFIER, useClass: PrismaNotifier },
  ],
  exports: [NOTIFIER],
})
export class NotificationsModule {}
