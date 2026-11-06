import { Inject, Injectable } from '@nestjs/common';
import { Page, PageRequest } from '../../shared/application/pagination';
import { NotificationKind } from '../../shared/application/notifier.port';
import { Actor } from '../../shared/domain/actor';
import { NotFoundError } from '../../shared/domain/errors';

// --- Dominio y puerto ---

export interface UserNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: NotificationKind;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationRepository {
  listForRecipient(recipientId: string, page: PageRequest): Promise<Page<UserNotification> & { unread: number }>;
  findById(id: string): Promise<UserNotification | null>;
  markRead(id: string, at: Date): Promise<void>;
  markAllRead(recipientId: string, at: Date): Promise<number>;
  delete(id: string): Promise<void>;
  deleteAllForRecipient(recipientId: string): Promise<number>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NotificationRepository');

// --- Casos de uso: toda operacion se limita a las notificaciones del propio usuario ---

@Injectable()
export class MyNotificationsUseCases {
  constructor(@Inject(NOTIFICATION_REPOSITORY) private readonly notifications: NotificationRepository) {}

  list(actor: Actor, page: PageRequest) {
    return this.notifications.listForRecipient(actor.id, page);
  }

  async markRead(actor: Actor, id: string) {
    await this.findOwn(actor, id);
    await this.notifications.markRead(id, new Date());
  }

  markAllRead(actor: Actor) {
    return this.notifications.markAllRead(actor.id, new Date());
  }

  async delete(actor: Actor, id: string) {
    await this.findOwn(actor, id);
    await this.notifications.delete(id);
  }

  deleteAll(actor: Actor) {
    return this.notifications.deleteAllForRecipient(actor.id);
  }

  // Una notificacion ajena se trata como inexistente para no revelar que existe.
  private async findOwn(actor: Actor, id: string) {
    const notification = await this.notifications.findById(id);
    if (!notification || notification.recipientId !== actor.id) throw new NotFoundError('Notificación no encontrada');
    return notification;
  }
}
