'use client';

import React from 'react';
import { Loader2, Brain, Check } from 'lucide-react';

interface LoadingDialogProps {
  isOpen: boolean;
  currentBatch: number;
  totalBatches: number;
  processedRows: number;
  totalRows: number;
  error: string | null;
}

export function LoadingDialog({
  isOpen,
  currentBatch,
  totalBatches,
  processedRows,
  totalRows,
  error,
}: LoadingDialogProps) {
  if (!isOpen) return null;

  const progressPercent = totalRows > 0 ? Math.round((processedRows / totalRows) * 100) : 0;
  
  // Custom ASCII/Block Progress Bar representation: e.g. █████░░░░░
  const blockCount = 10;
  const filledBlocks = Math.round((progressPercent / 100) * blockCount);
  const emptyBlocks = blockCount - filledBlocks;
  const asciiProgressBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl text-center space-y-6">
        
        {/* Glow decoration */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

        {error ? (
          <div className="space-y-4">
            <div className="inline-flex p-3 bg-rose-500/20 text-rose-400 rounded-full">
              <span className="text-xl font-bold">!</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-150">Import Failed</h3>
            <p className="text-sm text-rose-400 bg-rose-950/20 border border-rose-900/30 p-3 rounded-lg text-left overflow-auto max-h-32 select-text">
              {error}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Icon */}
            <div className="relative flex justify-center">
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full animate-pulse relative z-10">
                <Brain className="w-8 h-8 animate-bounce" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-zinc-200">
                {processedRows === 0 ? 'Uploading CSV File...' : 'Processing Lead Records with AI...'}
              </h3>
              <p className="text-xs text-zinc-500">
                GrowEasy AI is reading layouts, parsing contacts, and cleaning fields
              </p>
            </div>

            {/* Custom Terminal Block Progress Bar */}
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 font-mono text-left space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>[Status]</span>
                <span className="text-indigo-400">{progressPercent}% Complete</span>
              </div>
              <div className="text-lg text-zinc-200 tracking-wider font-semibold select-none">
                {asciiProgressBar}
              </div>
              <div className="flex justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
                <span>Batch: {currentBatch} / {totalBatches}</span>
                <span>Records: {processedRows} / {totalRows}</span>
              </div>
            </div>

            {/* Spinner Status Label */}
            <div className="flex items-center justify-center space-x-2 text-sm text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Analyzing columns & mapping schema...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
