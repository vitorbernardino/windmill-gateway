import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter as BullBoardExpressAdapter } from '@bull-board/express';
import { getQueueToken } from '@nestjs/bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 const serverAdapter = new BullBoardExpressAdapter();
 serverAdapter.setBasePath('/admin/queues');

 const dockerQueue = app.get(getQueueToken('windmill-creation-queue'));

 createBullBoard({
   queues: [new BullAdapter(dockerQueue)],
   serverAdapter: serverAdapter,
 });

 app.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
