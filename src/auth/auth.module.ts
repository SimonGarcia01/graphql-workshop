import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { RolesPermissionsModule } from './roles-permissions/roles-permissions.module';
import { User } from './users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UsersModule,
        RolesModule,
        PermissionsModule,
        RolesPermissionsModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                //If the JWT_SECRET is not defined, throw an error to prevent the app to start without a secret key
                const secret = config.get<string>('JWT_SECRET');
                if (!secret) {
                    throw new Error('JWT_SECRET is not defined');
                }

                //The expiresIn is defined in the .env file, but if its not, the default is 1 hour
                const expiresIn = config.get<string>('JWT_EXPIRES_IN') || '1h';

                return {
                    secret,
                    signOptions: {
                        expiresIn: expiresIn as JwtSignOptions['expiresIn'],
                    },
                };
            },
        }),
    ],
    providers: [AuthResolver, AuthService, JwtStrategy],
})
export class AuthModule {}
