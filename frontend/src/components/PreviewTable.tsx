'use client';

import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

interface PreviewTableProps {
  data: Array<Record<string, string>>;
}

export function PreviewTable({ data }: PreviewTableProps) {
  // Dynamically extract columns based on the keys of the first record
  const columns = useMemo<ColumnDef<Record<string, string>>[]>(() => {
    if (data.length === 0) return [];
    
    // Extract headers
    const headers = Object.keys(data[0]);
    
    return headers.map((header) => ({
      accessorKey: header,
      header: header,
      cell: (info) => (
        <span className="text-zinc-300 font-normal truncate max-w-[200px] block" title={info.getValue() as string}>
          {info.getValue() as string || '-'}
        </span>
      ),
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/50">
        No preview data available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Raw CSV Preview ({data.length} rows detected)
        </h3>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full">
          Pre-AI Analysis Mode
        </span>
      </div>
      
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
        {/* Scrollable container with sticky header */}
        <div className="max-h-[400px] overflow-auto scrollbar-thin scrollbar-thumb-zinc-700">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-zinc-950 z-20 shadow-md border-b border-zinc-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 font-semibold text-zinc-300 bg-zinc-950 text-xs uppercase tracking-wider select-none border-b border-zinc-800 whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-zinc-800/30 transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2.5 align-middle border-b border-zinc-800/30"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
