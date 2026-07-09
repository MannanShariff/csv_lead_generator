import Papa from 'papaparse';
import fs from 'fs';
import { AIService } from './ai.service';
import { CRMLead } from '../types/crm';

export class CSVService {
  private aiService = new AIService();

  public async processCSV(
    filePath: string,
    onProgress?: (progress: {
      processed: number;
      total: number;
      batch: number;
      totalBatches: number;
      records: CRMLead[];
    }) => void
  ): Promise<{ records: CRMLead[]; summary: { imported: number; skipped: number } }> {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parseResult = Papa.parse<Record<string, any>>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    const rawRecords = parseResult.data;
    const totalRecords = rawRecords.length;
    
    if (totalRecords === 0) {
      return {
        records: [],
        summary: { imported: 0, skipped: 0 },
      };
    }

    const batchSize = 20;
    const totalBatches = Math.ceil(totalRecords / batchSize);
    
    const allCRMLeads: CRMLead[] = [];
    let processedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, totalRecords);
      const batchRows = rawRecords.slice(start, end);

      console.log(`Processing batch ${i + 1}/${totalBatches} (${batchRows.length} rows)...`);

      const batchResults = await this.aiService.extractCRMLeads(batchRows);
      allCRMLeads.push(...batchResults);

      const batchSkipped = batchRows.length - batchResults.length;
      skippedCount += batchSkipped;
      processedCount += batchRows.length;

      if (onProgress) {
        onProgress({
          processed: processedCount,
          total: totalRecords,
          batch: i + 1,
          totalBatches: totalBatches,
          records: batchResults,
        });
      }
    }

    return {
      records: allCRMLeads,
      summary: {
        imported: allCRMLeads.length,
        skipped: skippedCount,
      },
    };
  }
}
