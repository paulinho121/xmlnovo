/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Code, CheckCircle, AlertCircle, Copy, Download, RefreshCw, File } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [duimpFile, setDuimpFile] = useState<File | null>(null);
  const [duimpText, setDuimpText] = useState("");
  const [duimpInputType, setDuimpInputType] = useState<"file" | "text">("text");

  const [nfFile, setNfFile] = useState<File | null>(null);
  const [nfText, setNfText] = useState("");
  const [nfInputType, setNfInputType] = useState<"file" | "text">("text");

  const [internalCodes, setInternalCodes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [xmlResult, setXmlResult] = useState<string | null>(null);
  const [errorResult, setErrorResult] = useState<string | null>(null);

  const [copySuccess, setCopySuccess] = useState(false);

  const handleDuimpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDuimpFile(e.target.files[0]);
    }
  };

  const handleNfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNfFile(e.target.files[0]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorResult(null);
    setXmlResult(null);

    try {
      const formData = new FormData();
      
      if (duimpInputType === "file" && duimpFile) {
        formData.append("duimpFile", duimpFile);
      } else if (duimpInputType === "text" && duimpText.trim() !== "") {
        formData.append("duimpText", duimpText.trim());
      } else {
        throw new Error("Por favor, forneça o extrato da DUIMP.");
      }

      if (nfInputType === "file" && nfFile) {
        formData.append("nfFile", nfFile);
      } else if (nfInputType === "text" && nfText.trim() !== "") {
        formData.append("nfText", nfText.trim());
      } else {
        throw new Error("Por favor, forneça o espelho da Nota Fiscal.");
      }

      if (internalCodes.trim() !== "") {
        formData.append("internalCodes", internalCodes.trim());
      }

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate XML");
      }

      const data = await response.json();
      setXmlResult(data.xml);
    } catch (err: any) {
      setErrorResult(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (xmlResult) {
      navigator.clipboard.writeText(xmlResult);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownload = () => {
    if (xmlResult) {
      const blob = new Blob([xmlResult], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "importacao_declaracao.xml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const resetForm = () => {
    setXmlResult(null);
    setErrorResult(null);
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8 tracking-tight">
        
        {/* Header */}
        <header className="space-y-2 border-b-2 border-brand-line bg-brand-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-accent flex items-center justify-center text-brand-white">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-normal">
              Conversor <strong>DUIMP → XML</strong>
            </h1>
          </div>
          <div className="text-xs font-mono opacity-80 hidden md:block">
            v2.4.0-build.82 // DESPACHO ADUANEIRO
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!xmlResult ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleGenerate} 
              className="bg-brand-surface border border-brand-line p-6 md:p-8 space-y-8 shadow-sm"
            >
              
              {errorResult && (
                <div className="bg-brand-white border border-[#ff0000] text-[#ff0000] px-4 py-3 flex items-start gap-3 text-sm font-mono">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <p>{errorResult}</p>
                </div>
              )}

              {/* DUIMP Input Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-brand-line pb-2">
                  <h2 className="text-[10px] font-bold uppercase opacity-70 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    1. Extrato da DUIMP
                  </h2>
                  <div className="flex bg-brand-white border border-brand-line text-[10px] font-bold uppercase">
                    <button
                      type="button"
                      onClick={() => setDuimpInputType("text")}
                      className={`px-3 py-1 transition-colors ${duimpInputType === "text" ? "bg-brand-line text-brand-bg" : "text-brand-ink hover:bg-brand-header"}`}
                    >
                      Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuimpInputType("file")}
                      className={`px-3 py-1 transition-colors flex items-center gap-1 ${duimpInputType === "file" ? "bg-brand-line text-brand-bg" : "text-brand-ink hover:bg-brand-header"}`}
                    >
                      PDF
                    </button>
                  </div>
                </div>
                
                {duimpInputType === "text" ? (
                  <textarea
                    value={duimpText}
                    onChange={(e) => setDuimpText(e.target.value)}
                    placeholder="Cole todo o conteúdo do Extrato da DUIMP aqui..."
                    className="w-full h-40 bg-brand-white border border-brand-line p-4 focus:bg-brand-header outline-none transition-all resize-none text-brand-ink font-mono text-[11px] leading-relaxed"
                  />
                ) : (
                  <div className="w-full h-40 bg-brand-white border border-dashed border-brand-line flex flex-col items-center justify-center relative hover:bg-brand-header transition-colors">
                    <input 
                      type="file" 
                      accept="application/pdf,.pdf" 
                      onChange={handleDuimpFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <File className={`w-8 h-8 mb-3 ${duimpFile ? 'text-brand-accent' : 'text-brand-ink'}`} />
                    <p className="text-[10px] uppercase font-bold">
                      {duimpFile ? duimpFile.name : "Clique ou arraste o PDF da DUIMP aqui"}
                    </p>
                    {duimpFile && <p className="text-[10px] font-mono mt-1 opacity-70">Arquivo selecionado</p>}
                  </div>
                )}
              </div>

              {/* NF Input Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-brand-line pb-2">
                  <h2 className="text-[10px] font-bold uppercase opacity-70 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    2. Espelho de Nota Fiscal
                  </h2>
                  <div className="flex bg-brand-white border border-brand-line text-[10px] font-bold uppercase">
                    <button
                      type="button"
                      onClick={() => setNfInputType("text")}
                      className={`px-3 py-1 transition-colors ${nfInputType === "text" ? "bg-brand-line text-brand-bg" : "text-brand-ink hover:bg-brand-header"}`}
                    >
                      Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => setNfInputType("file")}
                      className={`px-3 py-1 transition-colors flex items-center gap-1 ${nfInputType === "file" ? "bg-brand-line text-brand-bg" : "text-brand-ink hover:bg-brand-header"}`}
                    >
                      PDF
                    </button>
                  </div>
                </div>
                
                {nfInputType === "text" ? (
                  <textarea
                    value={nfText}
                    onChange={(e) => setNfText(e.target.value)}
                    placeholder="Cole os dados do espelho da NF (base II, alíquotas, taxas) aqui..."
                    className="w-full h-40 bg-brand-white border border-brand-line p-4 focus:bg-brand-header outline-none transition-all resize-none text-brand-ink font-mono text-[11px] leading-relaxed"
                  />
                ) : (
                  <div className="w-full h-40 bg-brand-white border border-dashed border-brand-line flex flex-col items-center justify-center relative hover:bg-brand-header transition-colors">
                    <input 
                      type="file" 
                      accept="application/pdf,.pdf" 
                      onChange={handleNfFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <File className={`w-8 h-8 mb-3 ${nfFile ? 'text-brand-accent' : 'text-brand-ink'}`} />
                    <p className="text-[10px] font-bold uppercase text-brand-ink">
                      {nfFile ? nfFile.name : "Clique ou arraste o PDF do Espelho NF aqui"}
                    </p>
                    {nfFile && <p className="text-[10px] font-mono mt-1 opacity-70">Arquivo selecionado</p>}
                  </div>
                )}
              </div>

              {/* Optional Section */}
              <div className="space-y-4">
                <div className="border-b border-brand-line pb-2">
                  <h2 className="text-[10px] font-bold uppercase opacity-70 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    3. Códigos Internos (Opcional)
                  </h2>
                </div>
                <textarea
                  value={internalCodes}
                  onChange={(e) => setInternalCodes(e.target.value)}
                  placeholder="Ex: 8539.5100 - COD-1234\n9405.4200 - COD-9988\nSe fornecido, será prefixado em <descricaoMercadoria>..."
                  className="w-full h-24 bg-brand-white border border-brand-line p-4 focus:bg-brand-header outline-none transition-all resize-none text-brand-ink font-mono text-[11px] leading-relaxed"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-brand-line">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-line hover:opacity-90 text-brand-white font-bold py-3 px-6 transition-all border border-brand-line flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-brand-white/30 border-t-brand-white rounded-full animate-spin" />
                      Processando e Gerando XML...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Gerar XML de Importação
                    </>
                  )}
                </button>
              </div>

            </motion.form>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-white border border-brand-line p-0 flex flex-col space-y-0 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-brand-line p-4 bg-brand-surface">
                <div className="flex items-center gap-3">
                  <div className="text-brand-ink">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-bold uppercase">XML Gerado com Sucesso</h2>
                    <p className="text-[11px] font-mono opacity-80">Extração e agrupamento consolidados.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-white border border-brand-line hover:bg-brand-header text-brand-ink transition-colors text-[10px] font-bold uppercase"
                  >
                    {copySuccess ? <CheckCircle className="w-3 h-3 text-[#0F0]" /> : <Copy className="w-3 h-3" />}
                    {copySuccess ? "Copiado!" : "Copiar"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-line hover:opacity-90 text-brand-white transition-colors text-[10px] font-bold uppercase"
                  >
                    <Download className="w-3 h-3" />
                    Baixar
                  </button>
                </div>
              </div>

              <div className="bg-[#1e1e1e] p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
                <pre className="text-[#9cdcfe] font-mono text-[11px] leading-relaxed">
                  <code>{xmlResult}</code>
                </pre>
              </div>

              <div className="p-4 flex justify-start bg-brand-surface border-t-2 border-brand-line">
                <button
                   onClick={resetForm}
                   className="text-brand-ink hover:underline transition-colors text-[10px] font-bold uppercase flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Gerar nova conversão
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
