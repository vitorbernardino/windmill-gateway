import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueModule } from './queue-processor/queue.module';
import { HttpModule } from '@nestjs/axios';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          // password: configService.get<string>('REDIS_PASSWORD'), 
        },
      }),
      inject: [ConfigService],
    }),
    QueueModule,
    HttpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
