import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

const FileUpload = ({ onFilesSelected, disabled }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles && rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} is not a PDF file. Please upload only PDF files.`, {
              duration: 4000,
              icon: '📄'
            });
          } else if (error.code === 'file-too-large') {
            toast.error(`${file.name} is too large. Maximum file size is 50MB.`, {
              duration: 4000,
              icon: '⚠️'
            });
          } else {
            toast.error(`${file.name} was rejected: ${error.message}`, {
              duration: 4000
            });
          }
        });
      });
      return;
    }

    // Handle accepted files
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Remove accept to show all files in file picker
    // Validation happens in the validator function
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled,
    validator: (file) => {
      // Custom validator - files will be visible but validated on selection
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      if (!isPDF) {
        return {
          code: 'file-invalid-type',
          message: 'Only PDF files are allowed'
        };
      }
      
      if (file.size > 50 * 1024 * 1024) {
        return {
          code: 'file-too-large',
          message: 'File is larger than 50MB'
        };
      }
      
      return null;
    }
  });

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
          ${disabled 
            ? 'opacity-50 cursor-not-allowed border-slate-600 bg-slate-800/50' 
            : isDragActive 
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02] cursor-pointer' 
              : 'border-white/30 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10 cursor-pointer'
          }
          backdrop-blur-sm shadow-xl
        `}
      >
        <input {...getInputProps()} />
        <div className="py-16 px-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
              ${isDragActive 
                ? 'bg-cyan-500/20 scale-110' 
                : 'bg-white/10'
              }
            `}>
              <svg
                className={`
                  w-12 h-12 transition-colors duration-300
                  ${isDragActive ? 'text-cyan-400' : 'text-slate-400'}
                `}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
          </div>
          {isDragActive ? (
            <p className="text-xl font-semibold text-cyan-400 mb-2">Drop the PDF files here...</p>
          ) : (
            <>
              <p className="text-xl font-semibold text-white mb-2">Drag & drop PDF files here, or click to select</p>
              <p className="text-sm text-slate-400">Maximum file size: 50MB</p>
            </>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-cyan-500/20 rounded-lg text-cyan-400 text-sm font-bold">
              {files.length}
            </span>
            Selected Files
          </h3>
          <ul className="space-y-3">
            {files.map((file, index) => (
              <li 
                key={index} 
                className="group flex items-center justify-between gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{file.name}</p>
                    <p className="text-sm text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={disabled}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
