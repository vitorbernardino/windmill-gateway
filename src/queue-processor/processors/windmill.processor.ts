import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { WindmillJobData } from "../dto/job-data.dto";
import { HttpService } from "@nestjs/axios";

@Processor('windmill-creation-queue')
export class QueueProcessor {
    
    constructor(private readonly httpService: HttpService) {}

    @Process('create-docker-env')
    async handleCreateDockerEnv(job: Job<WindmillJobData>) {
  
      try {
        // **Aqui implementa a lógica para acionar o Windmill**
        // Isso pode ser uma chamada HTTP para um endpoint do Windmill,
        // ou a execução de um script do Windmill CLI, etc.
  
        // Exemplo conceitual de chamada HTTP para o Windmill:
        const windmillUrl = `WINDMILL_WEBHOOK_OR_API_ENDPOINT`;
        const windmillPayload = {
          pr_number: job.data.prNumber,
          pr_url: job.data.prUrl,
          commit_sha: job.data.commitSha,
          repository: job.data.repositoryFullName,
          action: job.data.action,
        };
  
        // Se o Windmill for acionado via HTTP POST:
        // try {
        //   const response = await firstValueFrom(
        //     this.httpService.post(windmillUrl, windmillPayload, {
        //       headers: { 'Authorization': `Bearer YOUR_WINDMILL_TOKEN` } 
        //     })
        //   );
        // } catch (error) {
        //   throw error; // Isso fará o BullMQ tentar novamente se configurado
        // }
  
        // **Simulação do processamento:**
        await new Promise(resolve => setTimeout(resolve, 5000)); 

  
      } catch (error) {
        throw error;
      }
    }


}