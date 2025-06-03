import { Process, Processor, ProcessorOptions } from "@nestjs/bull";
import { Job } from "bull";
import { WindmillJobData } from "../dto/job-data.dto";
import { HttpService } from "@nestjs/axios";
import { JobCompletionService } from "../services/job-completion.service";
import { ConfigService } from "@nestjs/config";

@Processor('windmill-creation-queue')
export class QueueProcessor {
    private readonly windmillCallbackBaseUrl: string;

    constructor(
      private readonly jobCompletionService: JobCompletionService,
      private readonly configService: ConfigService,
      private readonly httpService: HttpService
    ) {
      const appHost = this.configService.get<string>('APP_HOST', 'http://localhost');
      const appPort = this.configService.get<number>('PORT', 3000);
      this.windmillCallbackBaseUrl = `${appHost}:${appPort}/webhook/windmill-callback`;
    }
    
    @Process({ name: 'create-docker-env', concurrency: 1 })
    async handleCreateDockerEnv(job: Job<WindmillJobData>) {
  
      try {

        const windmillPayload = {
          pr_number: job.data.prNumber,
          pr_url: job.data.prUrl,
          commit_sha: job.data.commitSha,
          repository: job.data.repositoryFullName,
          action: job.data.action,
          callback_url: `${this.windmillCallbackBaseUrl}/${job.id}`, 
          job_id: job.id,
        };

        const windmillTriggerUrl = ``; 
  
        // Exemplo de chamada HTTP para o Windmill
      // try {
      //   await firstValueFrom(
      //     this.httpService.post(windmillTriggerUrl, windmillPayload, {
      //       headers: { 'Authorization': `Bearer WINDMILL_TRIGGER_TOKEN` }
      //     })
      //   );
      // } catch (error) {
      //   throw error; 
      // }
  
        // **Simulação do processamento:**
        const windmillResult = await this.jobCompletionService.waitForCompletion(job.id.toString()); 

      } catch (error) {
        throw error;
      }
    }


}