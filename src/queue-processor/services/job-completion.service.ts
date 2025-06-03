import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PendingJob } from "../dto/pending-job.dto";

@Injectable()
export class JobCompletionService {
  private pendingJobs = new Map<string, PendingJob>();
  private readonly DEFAULT_TIMEOUT = 15 * 60 * 1000; 

  waitForCompletion(jobId: string, timeoutMs: number = this.DEFAULT_TIMEOUT): Promise<any> {
    if (this.pendingJobs.has(jobId)) {
      return Promise.reject(new Error(`Job ${jobId} já está aguardando conclusão.`));
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingJobs.has(jobId)) {
          this.pendingJobs.delete(jobId);
          reject(new HttpException(`Timeout: Windmill não respondeu para o job ${jobId}`, HttpStatus.GATEWAY_TIMEOUT));
        }
      }, timeoutMs);

      this.pendingJobs.set(jobId, { resolve, reject, timer });
    });
  }

  signalJobCompleted(jobId: string, data: any): void {
    const job = this.pendingJobs.get(jobId);
    if (job) {
      clearTimeout(job.timer);
      job.resolve(data);
      this.pendingJobs.delete(jobId);
    } else {
      throw new Error(`Sinal de conclusão recebido para job ${jobId} que não estava pendente ou já foi finalizado (possível timeout ou sinal duplicado).`);
    }
  }

  signalJobFailed(jobId: string, errorData: any): void {
    const job = this.pendingJobs.get(jobId);
    if (job) {
      clearTimeout(job.timer);
      job.reject(errorData);
      this.pendingJobs.delete(jobId);
    } else {
      throw new Error(`Sinal de falha recebido para job ${jobId} que não estava pendente ou já foi finalizado.`);
    }
  }

}