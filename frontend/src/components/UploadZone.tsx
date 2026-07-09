'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
}

export function UploadZone({ onFileSelected, selectedFile }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0]);
    }
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
          : selectedFile
          ? 'border-emerald-500 bg-emerald-500/5'
          : 'border-zinc-700 hover:border-indigo-500/50 hover:bg-zinc-800/30'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full transition-all duration-300 ${
          isDragActive ? 'scale-110 bg-indigo-500/20 text-indigo-400' :
          selectedFile ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
        }`}>
          {selectedFile ? <FileSpreadsheet className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
        </div>
        
        {selectedFile ? (
          <div>
            <p className="text-emerald-400 font-semibold text-lg">{selectedFile.name}</p>
            <p className="text-zinc-400 text-sm mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            <p className="text-indigo-400 text-xs mt-3 bg-indigo-500/10 px-3 py-1.5 rounded-full inline-block font-medium">
              Drag or click to change file
            </p>
          </div>
        ) : (
          <div>
            <p className="text-zinc-200 font-medium text-lg">
              {isDragActive ? 'Drop your CSV file here...' : 'Drag & drop your CSV file here'}
            </p>
            <p className="text-zinc-400 text-sm mt-1">or click to browse from computer</p>
            <p className="text-zinc-500 text-xs mt-4">Only .csv files are supported</p>
          </div>
        )}
      </div>
    </div>
  );
}
