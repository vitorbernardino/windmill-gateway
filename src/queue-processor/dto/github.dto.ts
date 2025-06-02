interface GitHubWebhookPayload {
    action: string;
    pull_request?: {
      html_url: string;
      number: number;
      head: {
        sha: string;
        repo: {
          full_name: string;
        };
      };
      
    };
    repository?: {
      full_name: string;
    };
    
  }