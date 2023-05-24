import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from './customer/customer.module';
import { SagaModule } from './saga/saga.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + process.env.TYPEORM_ENTITIES],
      migrations: [process.env.TYPEORM_MIGRATIONS],
      logging: process.env.TYPEORM_LOGGING === 'true',
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
      migrationsRun: process.env.TYPEORM_MIGRATION_RUN === 'true',
      migrationsTableName: 'migrations',
    }),
    SagaModule,
    CustomerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
