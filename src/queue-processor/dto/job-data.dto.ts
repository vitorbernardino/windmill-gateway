export interface WindmillJobData {
    prNumber: number;
    prUrl: string;
    commitSha: string;
    repositoryFullName: string;
    action: string; // 'opened', 'reopened', 'synchronize'
    // Adicione quaisquer outros dados que o Windmill precise
  }