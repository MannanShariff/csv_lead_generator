'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Percent } from 'lucide-react';

interface StatsCardProps {
  imported: number;
  skipped: number;
}

export function StatsCard({ imported, skipped }: StatsCardProps) {
  const total = imported + skipped;
  const accuracy = total > 0 ? Math.round((imported / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Imported Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Successfully Imported</p>
            <h4 className="text-3xl font-bold text-emerald-400 mt-1">{imported}</h4>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-4">CRM records mapped & validated by AI</p>
      </div>

      {/* Skipped Card */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Skipped Records</p>
            <h4 className="text-3xl font-bold text-amber-400 mt-1">{skipped}</h4>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-4">Omitted due to missing contact details</p>
      </div>

      {/* Accuracy / Success Rate Card */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-950/10 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Import Accuracy</p>
            <h4 className="text-3xl font-bold text-indigo-400 mt-1">{accuracy}%</h4>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-4">Ratio of valid leads to total rows processed</p>
      </div>
    </div>
  );
}
