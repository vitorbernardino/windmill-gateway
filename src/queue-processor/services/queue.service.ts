import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { WindmillJobData } from "../dto/job-data.dto";



@Injectable()
export class QueueService {

  constructor(
    @InjectQueue('windmill-creation-queue') private readonly windmillQueue: Queue<WindmillJobData>,
  ) {}

 async addJobToQueue(jobData: WindmillJobData) {
    try {
      const job = await this.windmillQueue.add('create-docker-env', jobData, {
        attempts: 3, 
        backoff: {
          type: 'exponential',
          delay: 1000, 
        },
        removeOnComplete: true, 
        removeOnFail: 1000,   
      });
      return job;
    } catch (error) {
      throw error;
    }
  }
}

