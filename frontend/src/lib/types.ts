export interface CRMLead {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: 'GOOD_LEAD_FOLLOW_UP' | 'DID_NOT_CONNECT' | 'BAD_LEAD' | 'SALE_DONE' | '';
  crm_note: string;
  data_source: 'leads_on_demand' | 'meridian_tower' | 'eden_park' | 'varah_swamy' | 'sarjapur_plots' | '';
  possession_time: string;
  description: string;
}

export interface ImportSummary {
  imported: number;
  skipped: number;
}

export interface ProgressUpdate {
  type: 'progress';
  processed: number;
  total: number;
  batch: number;
  totalBatches: number;
}

export interface DoneResponse {
  type: 'done';
  success: boolean;
  summary: ImportSummary;
  records: CRMLead[];
}

export interface ErrorResponse {
  type: 'error';
  error: string;
}

export type StreamMessage = ProgressUpdate | DoneResponse | ErrorResponse;
