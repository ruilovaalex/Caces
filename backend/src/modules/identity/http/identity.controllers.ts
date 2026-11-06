import { Body, Controller, Get, HttpCode, Inject, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { APP_CONFIG, AppConfig } from '../../../config/env';
import { normalizePage } from '../../../shared/application/pagination';
import { Actor, Role, ROLES } from '../../../shared/domain/actor';
import { CurrentActor, Public } from '../../../shared/http/auth';
import { ChangeOwnPasswordUseCase, LoginUseCase, RequestPasswordResetUseCase, ResetPasswordUseCase } from '../application/auth.use-cases';
import { CreateUserUseCase, ListUsersUseCase, UpdateUserUseCase } from '../application/user-admin.use-cases';
import { MIN_PASSWORD_LENGTH } from '../domain/user';

class LoginDto {
  @ApiProperty({ example: 'coordinador@edusudamericano.edu.ec' })
  @IsEmail()
  @MaxLength(200)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  password: string;
}

class ChangePasswordDto {
  @ApiProperty() @IsString() @MaxLength(200) currentPassword: string;
  @ApiProperty() @IsString() @MinLength(MIN_PASSWORD_LENGTH) @MaxLength(200) newPassword: string;
}

class ForgotPasswordDto {
  @ApiProperty() @IsEmail() @MaxLength(200) email: string;
}

class ResetPasswordDto {
  @ApiProperty() @IsString() @MinLength(20) @MaxLength(200) token: string;
  @ApiProperty() @IsString() @MinLength(MIN_PASSWORD_LENGTH) @MaxLength(200) newPassword: string;
}

class PageQueryDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
}

class CreateUserDto {
  @ApiProperty() @IsEmail() @MaxLength(200) email: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(120) name: string;
  @ApiProperty({ enum: ROLES }) @IsIn(ROLES) role: Role;
  @ApiProperty() @IsString() @MinLength(MIN_PASSWORD_LENGTH) @MaxLength(200) password: string;
}

class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @ApiPropertyOptional({ enum: ROLES }) @IsOptional() @IsIn(ROLES) role?: Role;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(MIN_PASSWORD_LENGTH) @MaxLength(200) password?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly login: LoginUseCase,
    private readonly changePassword: ChangeOwnPasswordUseCase,
    private readonly requestReset: RequestPasswordResetUseCase,
    private readonly resetPassword: ResetPasswordUseCase,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  // Opciones publicas del inicio de sesion: el frontend decide si ofrece recuperar la clave por correo
  // o indica que la restablece el administrador (cuando no hay proveedor de correo configurado).
  @Public()
  @Get('options')
  options() {
    return { passwordRecovery: this.config.mailDriver === 'none' ? 'admin' : 'email', minPasswordLength: MIN_PASSWORD_LENGTH };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  signIn(@Body() body: LoginDto) {
    return this.login.execute(body.email, body.password);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(204)
  async forgot(@Body() body: ForgotPasswordDto) {
    await this.requestReset.execute(body.email);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('reset-password')
  @HttpCode(204)
  async reset(@Body() body: ResetPasswordDto) {
    await this.resetPassword.execute(body.token, body.newPassword);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentActor() actor: Actor) {
    return actor;
  }

  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(204)
  async change(@CurrentActor() actor: Actor, @Body() body: ChangePasswordDto) {
    await this.changePassword.execute(actor, body.currentPassword, body.newPassword);
  }
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly listUsers: ListUsersUseCase,
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
  ) {}

  @Get()
  list(@CurrentActor() actor: Actor, @Query() query: PageQueryDto) {
    return this.listUsers.execute(actor, normalizePage(query.page, query.pageSize));
  }

  @Post()
  create(@CurrentActor() actor: Actor, @Body() body: CreateUserDto) {
    return this.createUser.execute(actor, body);
  }

  @Patch(':id')
  update(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateUserDto) {
    return this.updateUser.execute(actor, id, body);
  }
}
