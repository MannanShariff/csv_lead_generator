'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { UploadZone } from '@/components/UploadZone';
import { PreviewTable } from '@/components/PreviewTable';
import { StatsCard } from '@/components/StatsCard';
import { ResultTable } from '@/components/ResultTable';
import { LoadingDialog } from '@/components/LoadingDialog';
import { importCSVStream } from '@/lib/api';
import { CRMLead, ImportSummary } from '@/lib/types';
import { FileSpreadsheet, Play, RotateCcw, AlertTriangle, Sparkles, Download, ChevronDown } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Array<Record<string, string>>>([]);
  const [crmLeads, setCrmLeads] = useState<CRMLead[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  
  // Loading & Progress State
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    processed: 0,
    total: 0,
    batch: 0,
    totalBatches: 0,
  });

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setCrmLeads([]);
    setSummary(null);

    // Parse locally for the preview table
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreviewData(results.data as Array<Record<string, string>>);
        setProgress((prev) => ({
          ...prev,
          total: results.data.length,
        }));
      },
      error: (err) => {
        setError(`Failed to parse CSV locally: ${err.message}`);
      },
    });
  };

  const handleConfirmImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setError(null);
    setProgress({
      processed: 0,
      total: previewData.length,
      batch: 1,
      totalBatches: Math.ceil(previewData.length / 20),
    });

    try {
      await importCSVStream(file, (message) => {
        if (message.type === 'progress') {
          setProgress({
            processed: message.processed,
            total: message.total,
            batch: message.batch,
            totalBatches: message.totalBatches,
          });
        } else if (message.type === 'done') {
          setCrmLeads(message.records);
          setSummary(message.summary);
          setIsImporting(false);
        } else if (message.type === 'error') {
          setError(message.error);
          setIsImporting(false);
        }
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during import.');
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setCrmLeads([]);
    setSummary(null);
    setError(null);
    setProgress({
      processed: 0,
      total: 0,
      batch: 0,
      totalBatches: 0,
    });
  };

  const [showDropdown, setShowDropdown] = useState(false);

  React.useEffect(() => {
    if (!showDropdown) return;
    const handleOutsideClick = () => setShowDropdown(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showDropdown]);

  const demoFiles = [
    { name: 'test_leads.csv', label: 'Standard Demo Leads' },
    { name: 'edge_case_leads.csv', label: 'Edge Case Leads' },
    { name: 'messy_leads_test.csv', label: 'Messy Leads Test' },
  ];

  const handleDownloadFile = (filename: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.location.href = `${API_BASE_URL}/download-sample/${filename}`;
  };

  return (
    <main className="min-h-screen pb-16 bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {/* Header Banner */}
      <header className="sticky top-0 z-30 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              GrowEasy <span className="text-indigo-400 font-medium">AI CSV Importer</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Demo CSV</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  {demoFiles.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => handleDownloadFile(file.name)}
                      className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-850 hover:text-zinc-100 transition-colors font-medium flex items-center space-x-2 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>{file.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-500/20">
              <Sparkles className="w-3 h-3" />
              Powered by Gemini
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        
        {/* Title Area */}
        {crmLeads.length === 0 && (
          <div className="text-center max-w-xl mx-auto space-y-4">
            <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight sm:text-4xl">
              Import Leads from Any CSV Layout
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              No standard column names required. Upload any client reports, marketing exports, or custom sheets. Our AI mapping engine does the matching instantly.
            </p>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 font-medium">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span>
                <strong className="text-indigo-400 font-semibold mr-1">Note:</strong> 
                The backend may take a few moments to wake up on the first request.
              </span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && !isImporting && crmLeads.length === 0 && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3 max-w-2xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-400">Import Error</h4>
              <p className="text-xs text-zinc-400 mt-1">{error}</p>
              <button onClick={handleReset} className="text-xs font-bold text-rose-400 underline mt-2">
                Clear and try again
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Upload File */}
        {previewData.length === 0 && crmLeads.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <UploadZone onFileSelected={handleFileSelected} selectedFile={file} />
          </div>
        )}

        {/* Step 2: Show Preview & Confirm Action */}
        {previewData.length > 0 && crmLeads.length === 0 && (
          <div className="space-y-6">
            <PreviewTable data={previewData} />
            
            {/* Control Panel */}
            <div className="flex justify-end items-center gap-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
              <button
                onClick={handleReset}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-800 hover:bg-zinc-900 transition-colors text-zinc-400"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={handleConfirmImport}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.01]"
              >
                <Play className="w-4 h-4" />
                <span>Confirm & Import Leads</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Display Parsed Results */}
        {crmLeads.length > 0 && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-bold text-zinc-200">Import Job Results</h3>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start New Import</span>
                </button>
              </div>
              <StatsCard
                imported={summary?.imported || 0}
                skipped={summary?.skipped || 0}
              />
            </div>

            {/* Results Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 px-1">
                Extracted CRM Leads
              </h3>
              <ResultTable records={crmLeads} />
            </div>
          </div>
        )}
      </div>

      {/* Progress & Processing Modal */}
      <LoadingDialog
        isOpen={isImporting}
        currentBatch={progress.batch}
        totalBatches={progress.totalBatches}
        processedRows={progress.processed}
        totalRows={progress.total}
        error={error}
      />
    </main>
  );
}
