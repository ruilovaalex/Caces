import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_CONFIG, AppConfig } from '../../config/env';
import { TOKEN_AUTHENTICATOR } from '../../shared/http/auth';
import { AuthenticateTokenUseCase, ChangeOwnPasswordUseCase, LoginUseCase } from './application/auth.use-cases';
import { CreateUserUseCase, ListUsersUseCase, UpdateUserUseCase } from './application/user-admin.use-cases';
import { PASSWORD_HASHER, TOKEN_SERVICE, USER_REPOSITORY } from './domain/ports';
import { AuthController, UsersController } from './http/identity.controllers';
import { BcryptPasswordHasher, JwtTokenService, PrismaUserRepository } from './infrastructure/adapters';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtExpiresIn as `${number}h` },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    LoginUseCase,
    AuthenticateTokenUseCase,
    ChangeOwnPasswordUseCase,
    ListUsersUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    { provide: TOKEN_AUTHENTICATOR, useExisting: AuthenticateTokenUseCase },
  ],
  exports: [TOKEN_AUTHENTICATOR],
})
export class IdentityModule {}
