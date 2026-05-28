"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { IngestionState, UploadResponse } from "@/lib/rag/types";

export function Dropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<IngestionState>("idle");
  const [filename, setFilename] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(f => f.type === "application/pdf");
    
    if (validFiles.length === 0) {
      setUploadState("error");
      setErrorMsg("Only PDF documents are supported.");
      return;
    }

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setFilename(validFiles.length > 1 ? `[${i + 1}/${validFiles.length}] ${file.name}` : file.name);
      setUploadState("uploading");
      setErrorMsg("");

      const formData = new FormData();
      formData.append("file", file);

      try {
        // 1. Uploading State
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json() as UploadResponse;
            throw new Error(errorData.message || "Upload failed");
          } else {
            throw new Error(`Server Error: ${res.status} ${res.statusText}`);
          }
        }

        // 2. Extracting State
        setUploadState("extracting");
        await new Promise(resolve => setTimeout(resolve, 600));

        // 3. Preparing Chunks
        setUploadState("chunking");
        await new Promise(resolve => setTimeout(resolve, 600));

        // 4. Generating Embeddings
        setUploadState("embedding");
        await new Promise(resolve => setTimeout(resolve, 600));

      } catch (err: any) {
        console.error(err);
        setUploadState("error");
        setErrorMsg(err.message || "An unexpected error occurred");
        // Break the loop on error
        setTimeout(() => {
          setUploadState("idle");
          setErrorMsg("");
        }, 4000);
        return;
      }
    }
    
    // 5. Ready
    setUploadState("complete");
    setFilename(validFiles.length > 1 ? `${validFiles.length} Documents Indexed` : validFiles[0].name);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    // Reset the input value so the same file can be selected again if needed
    e.target.value = "";
  };

  return (
    <div className="w-full font-mono">
      <AnimatePresence mode="wait">
        {uploadState === "idle" || uploadState === "error" ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center p-5 border border-dashed transition-all duration-200 cursor-pointer overflow-hidden bg-white group",
              isDragging 
                ? "border-black bg-zinc-50" 
                : uploadState === "error" 
                  ? "border-red-300 bg-red-50/50" 
                  : "border-border hover:border-black hover:bg-zinc-50"
            )}
          >
            <input 
              type="file" 
              accept=".pdf" 
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleFileSelect}
            />
            
            <div className="flex flex-col items-center text-center gap-1.5">
              {uploadState === "error" ? (
                <AlertCircle className="w-5 h-5 text-red-500" strokeWidth={2} />
              ) : (
                <UploadCloud className="w-5 h-5 text-zinc-500 transition-colors group-hover:text-black" strokeWidth={2} />
              )}
              
              <div>
                <h3 className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors",
                  uploadState === "error" ? "text-red-700" : "text-zinc-700 group-hover:text-black"
                )}>
                  {uploadState === "error" ? "UPLOAD FAILED" : "UPLOAD DOCUMENT"}
                </h3>
                <p className={cn(
                  "text-[9px] mt-0.5 transition-colors",
                  uploadState === "error" ? "text-red-500" : "text-zinc-400 group-hover:text-zinc-600"
                )}>
                  {uploadState === "error" ? errorMsg : "PDF ONLY • MAX 50MB"}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 border border-border bg-white relative overflow-hidden shadow-sm"
          >
            <div className="absolute top-0 left-0 h-1 bg-zinc-200 w-full" />
            <div className="absolute top-0 left-0 h-1 bg-black transition-all duration-500 ease-out" 
              style={{ 
                width: uploadState === 'uploading' ? '20%' : 
                       uploadState === 'extracting' ? '40%' : 
                       uploadState === 'chunking' ? '60%' : 
                       uploadState === 'embedding' ? '80%' : '100%' 
              }} 
            />
            
            <div className="flex items-center gap-3 mb-4">
              <File className="w-4 h-4 text-black shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-bold text-black truncate tracking-widest">{filename}</h4>
                <p className="text-[9px] text-zinc-500 mt-0.5 font-bold uppercase">Processing Pipeline</p>
              </div>
            </div>

            <div className="space-y-3 pl-1">
              <StatusRow 
                step="01" 
                title="Uploading Document" 
                active={uploadState === "uploading"} 
                done={["extracting", "chunking", "embedding", "complete"].includes(uploadState)} 
              />
              <StatusRow 
                step="02" 
                title="Extracting Text" 
                active={uploadState === "extracting"} 
                done={["chunking", "embedding", "complete"].includes(uploadState)} 
              />
              <StatusRow 
                step="03" 
                title="Preparing Chunks" 
                active={uploadState === "chunking"} 
                done={["embedding", "complete"].includes(uploadState)} 
              />
              <StatusRow 
                step="04" 
                title="Generating Vectors" 
                active={uploadState === "embedding"} 
                done={["complete"].includes(uploadState)} 
              />
              <StatusRow 
                step="05" 
                title="Ready for Retrieval" 
                active={false} 
                done={uploadState === "complete"} 
                isLast
              />
            </div>
            
            {uploadState === "complete" && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-4 border-t border-zinc-100 flex justify-center"
              >
                <button 
                  onClick={() => { setUploadState("idle"); setFilename(""); setErrorMsg(""); }}
                  type="button"
                  className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 hover:text-black transition-colors uppercase cursor-pointer z-20 relative"
                >
                  Upload Another Document
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusRow({ step, title, active, done, isLast = false }: { step: string, title: string, active: boolean, done: boolean, isLast?: boolean }) {
  return (
    <div className="relative flex items-center gap-3">
      {!isLast && (
        <div className={cn(
          "absolute left-2.5 top-5 bottom-[-12px] w-[2px]",
          done ? "bg-black" : "bg-zinc-200"
        )} />
      )}
      
      <div className={cn(
        "w-5 h-5 border flex items-center justify-center shrink-0 z-10 transition-colors duration-200 bg-white font-bold text-[8px]",
        active ? "border-black text-white bg-black" :
        done ? "border-black text-black" : "border-zinc-200 text-zinc-400"
      )}>
        {done ? <Check className="w-3 h-3" strokeWidth={3} /> : active ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={3} /> : step}
      </div>
      
      <div className="flex-1">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest transition-colors duration-200",
          active ? "text-black" : done ? "text-black" : "text-zinc-400"
        )}>
          {title}
        </span>
      </div>
    </div>
  );
}
