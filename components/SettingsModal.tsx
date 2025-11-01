
import React, { useState, useRef } from 'react';
import { Settings, Assignment } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ConfirmActionModal from './ConfirmActionModal';

interface DataToImportExport {
  assignments: Record<string, Assignment>;
  settings: Settings;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
  currentSettings: Settings;
  onClearPastAssignments: () => void;
  assignments: Record<string, Assignment>;
  onImportData: (data: DataToImportExport) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentSettings, 
  onClearPastAssignments,
  assignments,
  onImportData,
  showToast
}) => {
  const [settings, setSettings] = useState<Settings>({
    ...currentSettings,
    people: [...currentSettings.people].sort((a, b) => a.localeCompare(b)),
  });
  const [newPerson, setNewPerson] = useState('');
  const [personToDelete, setPersonToDelete] = useState<string | null>(null);
  const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isImportConfirmOpen, setImportConfirmOpen] = useState(false);
  const [dataToImport, setDataToImport] = useState<DataToImportExport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDayToggle = (dayIndex: number) => {
    setSettings(prev => {
      const newMeetingDays = prev.meetingDays.includes(dayIndex)
        ? prev.meetingDays.filter(d => d !== dayIndex)
        : [...prev.meetingDays, dayIndex];
      return { ...prev, meetingDays: newMeetingDays };
    });
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPerson.trim() && !settings.people.some(p => p.toLowerCase() === newPerson.trim().toLowerCase())) {
      setSettings(prev => ({
        ...prev,
        people: [...prev.people, newPerson.trim()].sort((a, b) => a.localeCompare(b)),
      }));
      setNewPerson('');
    }
  };

  const handleRemovePerson = (personToRemove: string) => {
    setPersonToDelete(personToRemove);
  };

  const handleConfirmDelete = () => {
    if (!personToDelete) return;
    setSettings(prev => ({
        ...prev,
        people: prev.people.filter(p => p !== personToDelete),
    }));
    setPersonToDelete(null);
  };
  
  const handleConfirmClear = () => {
    onClearPastAssignments();
    setClearConfirmOpen(false);
  };

  const handleSave = () => {
    onSave(settings);
  };
  
  const handleExport = () => {
    try {
        const dataToExport: DataToImportExport = {
            assignments: assignments,
            settings: currentSettings,
        };
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `backup_designacoes_${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Dados exportados com sucesso!', 'success');
    } catch (error) {
        console.error("Error exporting data:", error);
        showToast('Ocorreu um erro ao exportar os dados.', 'error');
    }
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result;
              if (typeof text !== 'string') {
                  throw new Error("O arquivo não é um arquivo de texto válido.");
              }
              const data = JSON.parse(text);

              if (data && typeof data.assignments === 'object' && data.settings && Array.isArray(data.settings.people) && Array.isArray(data.settings.meetingDays)) {
                  setDataToImport(data);
                  setImportConfirmOpen(true);
              } else {
                  throw new Error("O formato do arquivo de importação é inválido.");
              }
          } catch (error) {
              console.error("Error parsing import file:", error);
              showToast(error instanceof Error ? error.message : 'Erro ao ler o arquivo.', 'error');
          }
      };
      reader.onerror = () => {
          showToast('Falha ao ler o arquivo.', 'error');
      };
      reader.readAsText(file);
      
      if (event.target) {
        event.target.value = ''; // Reset for re-upload
      }
  };

  const handleConfirmImport = () => {
      if (dataToImport) {
          onImportData(dataToImport);
          onClose();
      }
      setImportConfirmOpen(false);
      setDataToImport(null);
  };


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-700 max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h2 className="text-2xl font-bold text-white">Configurações</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Fechar configurações">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto pr-2 flex-grow">
            {/* Dias de Reunião */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Dias de Reunião</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DAYS_OF_WEEK.map((day, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.meetingDays.includes(index)}
                      onChange={() => handleDayToggle(index)}
                      className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                    />
                    <span className="text-gray-300">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gerenciar Pessoas */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Gerenciar Pessoas</h3>
              <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <h4 className="text-md font-semibold text-gray-200 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Legenda dos Símbolos</span>
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                    Use os seguintes símbolos no final do nome para restringir as designações apenas para as partes indicadas:
                </p>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-start">
                        <code className="bg-gray-700 text-blue-300 font-mono px-2 py-0.5 rounded-md mr-3">!</code>
                        <span>Pode ser designado para <strong>Presidência, Leitura e Oração Final</strong>.</span>
                    </li>
                    <li className="flex items-start">
                        <code className="bg-gray-700 text-blue-300 font-mono px-2 py-0.5 rounded-md mr-3">*</code>
                        <span>Pode ser designado para <strong>Presidência e Oração Final</strong>.</span>
                    </li>
                    <li className="flex items-start">
                        <code className="bg-gray-700 text-blue-300 font-mono px-2 py-0.5 rounded-md mr-3">"</code>
                        <span>Pode ser designado para <strong>Oração Final</strong>.</span>
                    </li>
                </ul>
              </div>
              <form onSubmit={handleAddPerson} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  placeholder="Nome da pessoa"
                  className="flex-grow bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Adicionar</span>
                </button>
              </form>
              <ul className="space-y-2 max-h-60 overflow-y-auto bg-gray-900/50 p-3 rounded-md">
                {settings.people.map(person => (
                  <li key={person} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                    <span className="text-gray-300">{person}</span>
                    <button
                      onClick={() => handleRemovePerson(person)}
                      className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                      aria-label={`Remover ${person}`}
                    >
                      Remover
                    </button>
                  </li>
                ))}
                 {settings.people.length === 0 && (
                  <li className="text-center text-gray-500 p-4">Nenhuma pessoa adicionada.</li>
                )}
              </ul>
            </div>

            {/* Ações */}
            <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Ações</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={handleExport}
                      className="w-full text-left px-4 py-3 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 font-semibold transition flex items-center gap-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Exportar Dados</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                    <button
                        onClick={handleImportClick}
                        className="w-full text-left px-4 py-3 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 font-semibold transition flex items-center gap-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Importar Dados</span>
                    </button>
                </div>
                <p className="text-xs text-gray-500 mb-6 px-1">
                    Salve um backup de suas designações e configurações ou importe um arquivo para restaurar os dados.
                </p>
                 <button
                    onClick={() => setClearConfirmOpen(true)}
                    className="w-full text-left px-4 py-3 bg-red-900/50 text-red-300 rounded-md hover:bg-red-800/50 hover:text-red-200 font-semibold transition flex items-center gap-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Limpar Designações Antigas</span>
                </button>
                <p className="text-xs text-gray-500 mt-2 px-1">
                    Isso removerá permanentemente todas as designações de meses anteriores ao mês atual.
                </p>
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 font-semibold transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
      {personToDelete && (
        <ConfirmDeleteModal
            isOpen={!!personToDelete}
            onClose={() => setPersonToDelete(null)}
            onConfirm={handleConfirmDelete}
            personName={personToDelete}
        />
      )}
      {isClearConfirmOpen && (
        <ConfirmActionModal
            isOpen={isClearConfirmOpen}
            onClose={() => setClearConfirmOpen(false)}
            onConfirm={handleConfirmClear}
            title="Limpar Designações Antigas?"
            message="Esta ação removerá permanentemente todas as designações de meses anteriores. Tem certeza de que deseja continuar?"
            confirmButtonText="Sim, Limpar"
        />
      )}
      {isImportConfirmOpen && (
        <ConfirmActionModal
            isOpen={isImportConfirmOpen}
            onClose={() => setImportConfirmOpen(false)}
            onConfirm={handleConfirmImport}
            title="Importar Dados?"
            message="Isso substituirá TODAS as suas configurações e designações atuais. Esta ação não pode ser desfeita. Deseja continuar?"
            confirmButtonText="Sim, Importar"
            confirmButtonVariant="primary"
        />
      )}
    </>
  );
};

export default SettingsModal;
