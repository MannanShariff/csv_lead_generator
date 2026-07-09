'use client';

import React, { useState, useMemo } from 'react';
import { CRMLead } from '../lib/types';
import { Search, MapPin, Building, ShieldAlert, BadgeCheck, FileText, Download } from 'lucide-react';
import Papa from 'papaparse';
import { API_BASE_URL } from '../lib/api';

interface ResultTableProps {
  records: CRMLead[];
}

export function ResultTable({ records }: ResultTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const handleExportCSV = async () => {
    if (records.length === 0) return;
    try {
      const response = await fetch(`${API_BASE_URL}/prepare-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(records),
      });

      if (!response.ok) {
        throw new Error('Failed to prepare CSV export');
      }

      const data = await response.json();
      if (data.success && data.downloadUrl) {
        window.location.href = data.downloadUrl;
      } else {
        throw new Error(data.error || 'Failed to get export URL');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during CSV export');
    }
  };

  // Available unique statuses & sources for filtering
  const statuses = ['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE'];
  const sources = ['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots'];

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.crm_note.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || record.crm_status === statusFilter;
      const matchesSource = sourceFilter === 'all' || record.data_source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [records, searchTerm, statusFilter, sourceFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GOOD_LEAD_FOLLOW_UP':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Follow Up
          </span>
        );
      case 'DID_NOT_CONNECT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            No Connect
          </span>
        );
      case 'BAD_LEAD':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Bad Lead
          </span>
        );
      case 'SALE_DONE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Sale Done
          </span>
        );
      default:
        return <span className="text-zinc-500 text-xs italic">-</span>;
    }
  };

  const getSourceBadge = (source: string) => {
    if (!source) return <span className="text-zinc-500 text-xs italic">-</span>;
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
        {source.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, company, or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 text-zinc-200 placeholder-zinc-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Source Dropdown */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors border border-emerald-500/20 shadow-md shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-xs text-zinc-500 px-1">
        <span>
          Showing {filteredRecords.length} of {records.length} records
        </span>
        {filteredRecords.length !== records.length && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSourceFilter('all');
            }}
            className="text-indigo-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Table */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
        <div className="max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-zinc-700">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-zinc-950 z-20 shadow border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Lead Info</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Contact No</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Company & Job</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Source</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Location</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Notes & Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((lead, idx) => {
                  const hasPhone = lead.mobile_without_country_code;
                  const phoneFormatted = hasPhone
                    ? `${lead.country_code || ''} ${lead.mobile_without_country_code}`.trim()
                    : '-';

                  const locationArr = [lead.city, lead.state, lead.country].filter(Boolean);
                  const locationStr = locationArr.join(', ') || '-';

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-zinc-850/20 transition-colors duration-150"
                    >
                      {/* Lead Info */}
                      <td className="px-4 py-3 align-top">
                        <div>
                          <div className="font-semibold text-zinc-200">{lead.name || 'Unknown Lead'}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{lead.email || 'No Email'}</div>
                          {lead.created_at && (
                            <div className="text-[10px] text-zinc-600 mt-1">
                              Created: {lead.created_at}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Contact No */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <span className={`text-zinc-300 font-medium ${!hasPhone && 'text-zinc-650'}`}>
                          {phoneFormatted}
                        </span>
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-1">
                          {lead.company ? (
                            <div className="flex items-center gap-1 text-zinc-300">
                              <Building className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <span className="truncate max-w-[150px]">{lead.company}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-600 text-xs">-</span>
                          )}
                          {lead.lead_owner && (
                            <div className="text-xs text-zinc-500">
                              Owner: <span className="text-indigo-400">{lead.lead_owner}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        {getStatusBadge(lead.crm_status)}
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        {getSourceBadge(lead.data_source)}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 align-top">
                        {locationStr !== '-' ? (
                          <div className="flex items-start gap-1 text-zinc-300 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{locationStr}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>

                      {/* Notes & Details */}
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-2 text-xs text-zinc-400 max-w-[280px]">
                          {lead.crm_note && (
                            <div className="bg-zinc-800/40 p-2 rounded border border-zinc-800">
                              <div className="font-semibold text-[10px] text-zinc-500 uppercase tracking-wider mb-1">CRM Note:</div>
                              <p className="line-clamp-3 hover:line-clamp-none transition-all duration-300 cursor-pointer">{lead.crm_note}</p>
                            </div>
                          )}
                          
                          {lead.description && (
                            <div className="flex items-start gap-1">
                              <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                              <p className="line-clamp-2 italic text-zinc-500">{lead.description}</p>
                            </div>
                          )}

                          {lead.possession_time && (
                            <div className="text-[10px] text-zinc-500">
                              Possession Time: <span className="text-zinc-300 font-medium">{lead.possession_time}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
