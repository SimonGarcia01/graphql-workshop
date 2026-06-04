import './auth/enums/graphql.enums';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from '@/auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { PostsModule } from '@/posts/posts.module';
import { SeedModule } from './seed/seed.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/auth.guard';
import { PermissionsGuard } from './common/guards/permission.guard';

type SupportedDbTypes = 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mongodb' | 'oracle';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            context: ({ req }) => ({ req }),
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: configService.get<SupportedDbTypes>('DB_TYPE') ?? 'postgres',
                host: configService.get<string>('DB_HOST') ?? 'localhost',
                port: configService.get<number>('DB_PORT') ?? 5432,
                username: configService.get<string>('DB_USERNAME') ?? 'root',
                password: configService.get<string>('DB_PASSWORD') ?? 'root',
                database: configService.get<string>('DB_DATABASE') ?? 'test',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: configService.get<boolean>('DB_SYNCHRONIZE') ?? false,
            }),
        }),
        AuthModule,
        PostsModule,
        SeedModule,
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: PermissionsGuard },
    ],
})
export class AppModule {}
