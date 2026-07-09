import { Request, Response } from 'express';
import { CSVService } from '../services/csv.service';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

// Memory cache for temporary exports
const exportCache = new Map<string, string>();

export class CSVController {
  private csvService = new CSVService();

  public importCSV = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }

      const filePath = req.file.path;

      // Set headers for streaming NDJSON
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const result = await this.csvService.processCSV(filePath, (progress) => {
        res.write(JSON.stringify({
          type: 'progress',
          processed: progress.processed,
          total: progress.total,
          batch: progress.batch,
          totalBatches: progress.totalBatches,
        }) + '\n');
      });

      // Cleanup uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }

      // Write final done response
      res.write(JSON.stringify({
        type: 'done',
        success: true,
        summary: result.summary,
        records: result.records,
      }) + '\n');
      res.end();
    } catch (error: any) {
      console.error('Import CSV error:', error);
      
      // Cleanup uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('Failed to delete temp file on error:', err);
        }
      }

      if (res.headersSent) {
        res.write(JSON.stringify({ type: 'error', error: error.message || 'Internal Server Error' }) + '\n');
        res.end();
      } else {
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
      }
    }
  };

  public downloadSample = (req: Request, res: Response): void => {
    const filename = req.params.filename;
    
    // Safety check to prevent directory traversal
    const allowedFiles = ['test_leads.csv', 'edge_case_leads.csv', 'messy_leads_test.csv'];
    if (!allowedFiles.includes(filename)) {
      res.status(400).send('Invalid file name');
      return;
    }

    let filePath = path.join(process.cwd(), 'test_csv', filename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), '..', 'test_csv', filename);
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).send('File not found');
      return;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      res.status(200).send(fileContent);
    } catch (err: any) {
      res.status(500).send(`Failed to read CSV: ${err.message}`);
    }
  };

  public prepareExport = (req: Request, res: Response): void => {
    try {
      const records = req.body;
      if (!Array.isArray(records)) {
        res.status(400).json({ success: false, error: 'Invalid data format. Expected JSON array.' });
        return;
      }

      const Papa = require('papaparse');
      const csvContent = Papa.unparse(records);
      const fileId = crypto.randomUUID();
      
      exportCache.set(fileId, csvContent);
      
      const port = process.env.PORT || 5000;
      const downloadUrl = `http://localhost:${port}/api/download-export/${fileId}/groweasy_mapped_leads.csv`;
      
      res.json({ success: true, downloadUrl });
    } catch (error: any) {
      console.error('Export preparation failed:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to prepare export' });
    }
  };

  public downloadExport = (req: Request, res: Response): void => {
    const fileId = req.params.id as string;
    
    if (!fileId || !exportCache.has(fileId)) {
      res.status(404).send('Export file not found or expired.');
      return;
    }

    const csvContent = exportCache.get(fileId)!;
    exportCache.delete(fileId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="groweasy_mapped_leads.csv"');
    res.status(200).send(csvContent);
  };
}

