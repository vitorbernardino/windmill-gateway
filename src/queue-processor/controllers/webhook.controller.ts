import { Body, Controller, HttpCode, Post, Headers, InternalServerErrorException, Param, UnauthorizedException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QueueService } from "../services/queue.service";
import { JobCompletionService } from "../services/job-completion.service";
import { WindmillCallbackPayload } from "../dto/windmill-callback.dto";

@Controller('webhook')
export class WebhookController {
  private readonly webhookSecretToken: string  | undefined;
  private readonly windmillCallbackToken: string | undefined;

  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
    private readonly jobCompletionService: JobCompletionService,
  ) {
    this.webhookSecretToken = this.configService.get<string>('WEBHOOK_SECRET_TOKEN');
    this.windmillCallbackToken = this.configService.get<string>('WINDMILL_CALLBACK_TOKEN');
    if (!this.webhookSecretToken) {
      throw new Error('WEBHOOK_SECRET_TOKEN não está definido nas variáveis de ambiente.');
    }
    if (!this.windmillCallbackToken) {
      throw new Error('WINDMILL_CALLBACK_TOKEN não está definido.'); 
    }
  }

  @Post('github-pr')
  @HttpCode(202) 
  async handleGitHubPREvent(
    @Body() payload: GitHubWebhookPayload,
    @Headers('x-hub-signature-256') signature: string, 
    @Headers('x-github-event') githubEvent: string,
  ): Promise<{ message: string; jobId?: string }> {


    // **Autenticação Simples:
    // Para este exemplo, vamos verificar um cabeçalho customizado como 'x-auth-token'.
    // Se você estiver usando o 'x-hub-signature-256' do GitHub, a lógica de validação será diferente
    // e envolverá criptografia HMAC.
    // const authToken = headers['x-auth-token'];
    // if (authToken !== this.webhookSecretToken) {
    //   throw new UnauthorizedException('Token de autenticação inválido.');
    // }


    if (githubEvent === 'pull_request') {
      if (payload.action === 'opened' || payload.action === 'reopened' || payload.action === 'synchronize') {
        if (!payload.pull_request) {
          throw new InternalServerErrorException('Payload de pull_request inválido.');
        }

        try {
          const job = await this.queueService.addJobToQueue({
            prNumber: payload.pull_request.number,
            prUrl: payload.pull_request.html_url,
            commitSha: payload.pull_request.head.sha,
            repositoryFullName: payload.pull_request.head.repo.full_name,
            action: payload.action,
          });
          return { message: 'Evento de PR recebido e adicionado à fila.', jobId: job.id.toString() };
        } catch (error) {
          throw new InternalServerErrorException('Erro ao processar o evento de PR.');
        }
      } else {
        return { message: `Ação de PR '${payload.action}' ignorada.` };
      }
    } else {
      return { message: `Evento '${githubEvent}' ignorado.` };
    }
  }

  @Post('windmill-callback/:jobId')
  @HttpCode(200)
  handleWindmillCallback(
    @Param('jobId') jobId: string,
    @Body() payload: WindmillCallbackPayload,
    @Headers('authorization') authHeader: string, 
  ): { message: string } {

    const [type, token] = authHeader ? authHeader.split(' ') : [];
    if (type !== 'Bearer' || token !== this.windmillCallbackToken) {
      throw new UnauthorizedException('Token de callback do Windmill inválido.');
    }

    if (!jobId) {
        throw new NotFoundException('Job ID não fornecido no callback.');
    }

    if (payload.status === 'success') {
      this.jobCompletionService.signalJobCompleted(jobId, payload.data || { message: payload.message || 'Concluído com sucesso' });
      return { message: `Job ${jobId} sinalizado como concluído.` };
    } else if (payload.status === 'failure') {
      this.jobCompletionService.signalJobFailed(jobId, payload.data || new Error(payload.message || `Windmill reportou falha para o job ${jobId}`));
      return { message: `Job ${jobId} sinalizado como falho.` };
    } else {
      throw new ForbiddenException(`Status de callback inválido: ${payload.status}`);
    }
  }
}
