// app/admin/components/bulk-upload.tsx - Fixed
'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ValidationDetail {
  row: number;
  message: string;
  type: 'error' | 'conflict' | 'warning';
}

export function BulkUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [validationResults, setValidationResults] = useState<{
    totalRows: number;
    validRows: number;
    errors: number;
    conflicts: number;
    warnings: number;
    details: ValidationDetail[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/vnd.oasis.opendocument.spreadsheet'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls|ods)$/i)) {
      alert('Please upload an Excel or CSV file');
      return;
    }

    setUploadedFile(file);
    setUploadStatus('uploading');

    // Simulate file processing
    setTimeout(() => {
      // Mock validation results
      setValidationResults({
        totalRows: 50,
        validRows: 48,
        errors: 2,
        conflicts: 3,
        warnings: 1,
        details: [
          { row: 5, message: 'Invalid time format', type: 'error' },
          { row: 12, message: 'Room conflict detected', type: 'conflict' },
          { row: 23, message: 'Instructor not found', type: 'warning' },
        ]
      });
      
      setUploadStatus('success');
    }, 1500);
  };

  const handleUpload = () => {
    if (!uploadedFile) return;

    setUploadStatus('uploading');
    
    // Simulate API call
    setTimeout(() => {
      alert('Schedules uploaded successfully!');
      setUploadStatus('success');
      resetUpload();
    }, 2000);
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    setValidationResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    // Create and download template
    const templateData = [
      ['Time Slot', 'Days', 'Course Code', 'Course Description', 'Instructor', 'Room', 'Year Level', 'Semester'],
      ['8:00 AM - 11:00 AM', 'Monday/Tuesday', 'ITCP 106', 'Computer Programming 2', 'Ronilo Gayutin', 'CL2', 'second_year', 'second_sem'],
      ['1:00 PM - 3:00 PM', 'Thursday/Friday', 'ITDS 108', 'Data Structures', 'Maria Santos', 'TC', 'second_year', 'second_sem'],
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule_template.csv';
    a.click();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bulk Schedule Upload</h3>
          <p className="text-sm text-gray-600">Upload multiple schedules via Excel or CSV</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <div className="space-y-6">
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : uploadedFile
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,.xlsx,.xls,.ods"
            className="hidden"
          />
          
          {uploadStatus === 'uploading' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="mx-auto h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600"
            />
          ) : uploadedFile ? (
            <div className="space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Drag & drop or click to upload
                </p>
                <p className="text-sm text-gray-500">
                  Supports Excel (.xlsx, .xls) and CSV files
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Validation Results */}
        {validationResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-5 w-5 text-gray-400" />
              <h4 className="font-medium text-gray-900">Validation Results</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{validationResults.totalRows}</div>
                <div className="text-sm text-gray-500">Total Rows</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-700">{validationResults.validRows}</div>
                <div className="text-sm text-emerald-600">Valid Schedules</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-700">{validationResults.errors}</div>
                <div className="text-sm text-red-600">Errors</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-700">{validationResults.conflicts}</div>
                <div className="text-sm text-amber-600">Conflicts</div>
              </div>
            </div>

            {validationResults.details && validationResults.details.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Issues Detected:</p>
                <div className="space-y-2">
                  {validationResults.details.map((detail, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 p-3 rounded-lg text-sm ${
                        detail.type === 'error'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : detail.type === 'conflict'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {detail.type === 'error' ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : detail.type === 'conflict' ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <span>
                        Row {detail.row}: {detail.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          {uploadedFile && (
            <Button variant="outline" onClick={resetUpload}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleUpload}
            disabled={!uploadedFile || uploadStatus === 'uploading'}
            className="min-w-[120px]"
          >
            {uploadStatus === 'uploading' ? 'Processing...' : 'Upload Schedules'}
          </Button>
        </div>
      </div>
    </Card>
  );
}