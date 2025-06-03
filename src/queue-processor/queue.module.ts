import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './controllers/webhook.controller';
import { QueueService } from './services/queue.service';
import { QueueProcessor } from './processors/windmill.processor';
import { JobCompletionService } from './services/job-completion.service';

@Module({
    imports: [
      ConfigModule, 
      BullModule.registerQueue({
        name: 'windmill-creation-queue', 
      }),
    ],
    controllers: [WebhookController],
    providers: [QueueService, QueueProcessor, JobCompletionService],
  })
  export class QueueModule {}