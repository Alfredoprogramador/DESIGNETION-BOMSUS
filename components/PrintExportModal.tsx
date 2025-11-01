
import React, { useState } from 'react';

type Period = 'week' | 'month';
type Format = 'list' | 'spreadsheet';

interface PrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (period: Period, format: Format) => void;
  onDownloadPdf: (period: Period, format: Format) => void;
  onDownloadPng: (period: Period, format: Format) => void;
}

const PrintExportModal: React.FC<PrintExportModalProps> = ({ isOpen, onClose, onPrint, onDownloadPdf, onDownloadPng }) => {
  const [period, setPeriod] = useState<Period>('month');
  const [format, setFormat] = useState<Format>('spreadsheet');

  if (!isOpen) return null;

  const handlePrintClick = () => {
    onPrint(period, format);
    onClose();
  };

  const handlePdfClick = () => {
    onDownloadPdf(period, format);
    onClose();
  };

  const handlePngClick = () => {
    onDownloadPng(period, format);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Imprimir / Exportar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Período */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">1. Escolha o Período</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPeriod('week')}
              className={`p-4 rounded-md text-center transition-colors border-2 ${
                period === 'week' ? 'bg-blue-600 border-blue-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <span className="font-semibold">Semana Atual</span>
              <p className="text-xs text-gray-300">Apenas os dias da semana selecionada.</p>
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`p-4 rounded-md text-center transition-colors border-2 ${
                period === 'month' ? 'bg-blue-600 border-blue-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <span className="font-semibold">Mês Inteiro</span>
              <p className="text-xs text-gray-300">Todas as reuniões do mês atual.</p>
            </button>
          </div>
        </div>

        {/* Formato */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">2. Escolha o Formato</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('spreadsheet')}
              className={`p-4 rounded-md text-center transition-colors border-2 ${
                format === 'spreadsheet' ? 'bg-blue-600 border-blue-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <span className="font-semibold">Planilha</span>
              <p className="text-xs text-gray-300">Tabela com dias e designações.</p>
            </button>
            <button
              onClick={() => setFormat('list')}
              className={`p-4 rounded-md text-center transition-colors border-2 ${
                format === 'list' ? 'bg-blue-600 border-blue-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <span className="font-semibold">Lista Vertical</span>
              <p className="text-xs text-gray-300">Formato simples para quadros de aviso.</p>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-700">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 font-semibold transition order-last sm:order-first">
            Cancelar
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                  onClick={handlePngClick}
                  className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-semibold transition flex items-center justify-center gap-2"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                  <span>PNG</span>
              </button>
              <button
                onClick={handlePdfClick}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 14.95a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zM4.343 5.657a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM14.95 14.95a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z" /><path d="M10 6a4 4 0 100 8 4 4 0 000-8z" /></svg>
                <span>PDF</span>
              </button>
              <button
                onClick={handlePrintClick}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                <span>Imprimir</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintExportModal;