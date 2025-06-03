export interface WindmillCallbackPayload {
    status: 'success' | 'failure';
    message?: string;
    data?: any; 
  }