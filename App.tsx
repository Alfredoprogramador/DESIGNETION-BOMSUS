
import React, { useState, useMemo, useEffect } from 'react';
import { Assignment, Role, Settings, AssignmentValue } from './types';
import { ROLES_ORDER, DAYS_OF_WEEK } from './constants';
import { PEOPLE_LIST } from './data/people';
import * as db from './db';

import Header from './components/Header';
import WeekNavigator from './components/WeekNavigator';
import AssignmentCard from './components/AssignmentCard';
import AssignmentModal from './components/AssignmentModal';
import SettingsModal from './components/SettingsModal';
import PrintLayout from './components/PrintLayout';
import ReportPreviewModal from './components/ReportPreviewModal';
import PrintExportModal from './components/PrintExportModal';
import PrintListLayout from './components/PrintListLayout';

// --- Toast Component Definition ---
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'loading';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    if (type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  const baseClasses = "fixed bottom-5 right-5 z-50 flex items-center w-full max-w-xs p-4 space-x-4 text-gray-400 bg-gray-800 rounded-lg shadow-lg border";
  const typeClasses = {
    success: 'border-green-500 text-green-400',
    error: 'border-red-500 text-red-400',
    loading: 'border-blue-500 text-blue-400',
  };

  const icons = {
    success: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
    ),
    loading: (
       <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    ),
  };
  
  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
       <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-gray-700`}>
         {icons[type]}
       </div>
      <div className="ml-3 text-sm font-normal text-gray-200">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8"
        onClick={onClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
};
// --- End Toast Component ---


const App: React.FC = () => {
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});
  const [settings, setSettings] = useState<Settings>({
    meetingDays: [3, 6],
    people: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPrintExportModalOpen, setPrintExportModalOpen] = useState(false);
  const [printContent, setPrintContent] = useState<React.ReactNode>(null);

  const [assignmentToEdit, setAssignmentToEdit] = useState<{ date: string; role: Role } | null>(null);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'loading' } | null>(null);

  // PWA and install prompt logic
  useEffect(() => {
    // Register Service Worker for PWA capabilities
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }

    // Capture the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Data loading from cloud database
  useEffect(() => {
    const loadData = async () => {
      try {
        await db.initDB(); // Warms up the cache
        let [loadedAssignments, loadedSettings] = await Promise.all([
          db.getAllAssignments(),
          db.getSettings(),
        ]);
        
        setAssignments(loadedAssignments);
        setSettings(loadedSettings);

      } catch (error) {
        console.error("Failed to load data from cloud database", error);
        // Fallback to default settings if cloud DB fails
        setSettings({
          meetingDays: [3, 6],
          people: PEOPLE_LIST,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const startOfWeek = useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  }, [currentDate]);

  const meetingDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      if (settings.meetingDays.includes(day.getDay())) {
        dates.push(day);
      }
    }
    return dates;
  }, [startOfWeek, settings.meetingDays]);

  const lastAssignmentDates = useMemo(() => {
    const lastDates = new Map<string, string>();
    const sortedDates = Object.keys(assignments).sort();

    for (const dateKey of sortedDates) {
      const dayAssignments = assignments[dateKey];
      for (const role in dayAssignments) {
        const assignment = dayAssignments[role as Role];
        if (assignment) {
          lastDates.set(assignment.person, dateKey);
        }
      }
    }
    return lastDates;
  }, [assignments]);

  const handleDateChange = (change: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + change);
      return newDate;
    });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'loading') => {
    setToast({ message, type });
  };

  const handleSaveAssignment = async (date: string, role: Role, person: string, note: string) => {
    const originalAssignments = JSON.parse(JSON.stringify(assignments));
    const newAssignments = { ...assignments };
    if (!newAssignments[date]) {
      newAssignments[date] = {};
    }
    if (person === '') {
      delete newAssignments[date][role];
    } else {
      newAssignments[date][role] = { person, note };
    }
    
    // cleanup empty date entries
    if (Object.keys(newAssignments[date]).length === 0) {
        delete newAssignments[date];
    }
    
    setAssignments(newAssignments);
    setAssignmentToEdit(null);
    showToast('Salvando designação...', 'loading');

    try {
        await db.saveAssignments(newAssignments);
        showToast('Designação salva com sucesso!', 'success');
    } catch(e) {
        console.error("Failed to save assignment:", e);
        showToast('Falha ao salvar. Verifique sua conexão.', 'error');
        setAssignments(originalAssignments);
    }
  };
  
  const handleSaveSettings = async (newSettings: Settings) => {
    const originalSettings = JSON.parse(JSON.stringify(settings));
    const originalAssignments = JSON.parse(JSON.stringify(assignments));
    
    const newPeople = newSettings.people;

    const newAssignments = Object.keys(assignments).reduce((acc, dateKey) => {
        const dayAssignments = assignments[dateKey];
        const filteredDayAssignments = Object.keys(dayAssignments).reduce((dayAcc, roleKey) => {
            const role = roleKey as Role;
            const assignmentValue = dayAssignments[role];
            if (assignmentValue && newPeople.includes(assignmentValue.person)) {
                dayAcc[role] = assignmentValue;
            }
            return dayAcc;
        }, {} as Assignment);

        if (Object.keys(filteredDayAssignments).length > 0) {
            acc[dateKey] = filteredDayAssignments;
        }
        return acc;
    }, {} as Record<string, Assignment>);

    setAssignments(newAssignments);
    setSettings(newSettings);
    setSettingsModalOpen(false);
    showToast('Salvando configurações...', 'loading');
    
    try {
        await Promise.all([
          db.saveAssignments(newAssignments),
          db.saveSettings(newSettings)
        ]);
        showToast('Configurações salvas com sucesso!', 'success');
    } catch (e) {
        console.error("Failed to save settings:", e);
        showToast('Falha ao salvar. Verifique sua conexão.', 'error');
        setAssignments(originalAssignments);
        setSettings(originalSettings);
    }
  }

  const getDatesForPeriod = (period: 'week' | 'month'): Date[] => {
    if (period === 'week') {
      return meetingDates;
    }
    // For month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dates: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      if (settings.meetingDays.includes(date.getDay())) {
        dates.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };
  
  const handlePrepareAndPrint = (period: 'week' | 'month', format: 'list' | 'spreadsheet') => {
    const datesToPrint = getDatesForPeriod(period);
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();
    const title = period === 'week' ? `Designações da Semana` : `Designações de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
    
    let content;
    if (format === 'list') {
      content = <PrintListLayout datesToPrint={datesToPrint} assignments={assignments} title={title} />;
    } else {
      content = <PrintLayout datesToPrint={datesToPrint} assignments={assignments} title={title} settings={settings} />;
    }
    
    setPrintContent(content);
    
    // Use a timeout to allow React to render the new content before printing
    setTimeout(() => {
      window.print();
      setPrintContent(null);
    }, 200);
  };
  
  const handleDownloadPDF = async (period: 'week' | 'month', format: 'list' | 'spreadsheet') => {
    const jspdfGlobal = (window as any).jspdf;
    const html2canvas = (window as any).html2canvas;

    if (typeof jspdfGlobal === 'undefined' || typeof html2canvas === 'undefined') {
        showToast('Erro ao gerar PDF (bibliotecas não encontradas).', 'error');
        return;
    }

    const datesToPrint = getDatesForPeriod(period);
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();
    const title = period === 'week' ? `Designações da Semana` : `Designações de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;

    let content;
    if (format === 'list') {
        content = <PrintListLayout datesToPrint={datesToPrint} assignments={assignments} title={title} />;
    } else {
        content = <PrintLayout datesToPrint={datesToPrint} assignments={assignments} title={title} settings={settings} />;
    }

    showToast('Gerando PDF...', 'loading');
    setPrintContent(content);

    // Wait for the content to render
    await new Promise(resolve => setTimeout(resolve, 200));

    const printElement = document.querySelector('.print-container > div');
    if (!printElement) {
        showToast('Erro ao encontrar o conteúdo para exportar.', 'error');
        setPrintContent(null);
        return;
    }

    try {
        const canvas = await html2canvas(printElement as HTMLElement, {
            scale: 2,
            backgroundColor: format === 'spreadsheet' ? '#1f2937' : '#ffffff',
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = jspdfGlobal;
        
        const orientation = canvas.width > canvas.height ? 'l' : 'p';
        const doc = new jsPDF(orientation, 'px', [canvas.width, canvas.height]);
        
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        const fileName = `designacoes-${period === 'week' ? 'semana' : monthName}-${year}.pdf`;
        doc.save(fileName);
        showToast('PDF salvo com sucesso!', 'success');

    } catch (error) {
        console.error("Error generating PDF:", error);
        showToast('Ocorreu um erro ao gerar o PDF.', 'error');
    } finally {
        setPrintContent(null);
    }
  };

  const handleDownloadPNG = async (period: 'week' | 'month', format: 'list' | 'spreadsheet') => {
    const html2canvas = (window as any).html2canvas;

    if (typeof html2canvas === 'undefined') {
      showToast('Erro ao gerar imagem (biblioteca não encontrada).', 'error');
      return;
    }

    const datesToPrint = getDatesForPeriod(period);
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();
    const title = period === 'week' ? `Designações da Semana` : `Designações de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;

    let content;
    if (format === 'list') {
      content = <PrintListLayout datesToPrint={datesToPrint} assignments={assignments} title={title} />;
    } else {
      content = <PrintLayout datesToPrint={datesToPrint} assignments={assignments} title={title} settings={settings} />;
    }

    showToast('Gerando imagem...', 'loading');
    setPrintContent(content);

    await new Promise(resolve => setTimeout(resolve, 200));

    const printElement = document.querySelector('.print-container > div');
    if (!printElement) {
      showToast('Erro ao encontrar o conteúdo para exportar.', 'error');
      setPrintContent(null);
      return;
    }

    try {
      const canvas = await html2canvas(printElement as HTMLElement, {
        scale: 2,
        backgroundColor: format === 'spreadsheet' ? '#1f2937' : '#ffffff',
        useCORS: true
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const fileName = `designacoes-${period === 'week' ? 'semana' : monthName}-${year}.png`;
      link.download = fileName;
      link.href = image;
      link.click();
      showToast('Imagem salva com sucesso!', 'success');

    } catch (error) {
      console.error("Error generating PNG:", error);
      showToast('Ocorreu um erro ao gerar a imagem.', 'error');
    } finally {
      setPrintContent(null);
    }
  };
  
  const handleClearPastAssignments = async () => {
    const originalAssignments = JSON.parse(JSON.stringify(assignments));
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // JS months are 0-indexed
    const firstDayKey = `${year}-${String(month).padStart(2, '0')}-01`;

    const updatedAssignments = Object.entries(assignments)
        .filter(([dateKey]) => dateKey >= firstDayKey)
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {} as Record<string, Assignment>);

    setAssignments(updatedAssignments);
    setSettingsModalOpen(false);
    showToast('Limpando designações...', 'loading');

    try {
        await db.saveAssignments(updatedAssignments);
        showToast('Designações antigas limpas!', 'success');
    } catch (e) {
        console.error("Failed to clear past assignments:", e);
        showToast('Falha ao limpar. Verifique sua conexão.', 'error');
        setAssignments(originalAssignments);
    }
  };

  const handleInstall = () => {
    if (!installPromptEvent) {
      return;
    }
    installPromptEvent.prompt();
    installPromptEvent.userChoice.then(() => {
      setInstallPromptEvent(null);
    });
  };

  const handleImportData = async (data: { assignments: Record<string, Assignment>; settings: Settings; }) => {
    const originalAssignments = JSON.parse(JSON.stringify(assignments));
    const originalSettings = JSON.parse(JSON.stringify(settings));

    setAssignments(data.assignments);
    setSettings(data.settings);
    showToast('Importando dados...', 'loading');

    try {
        await Promise.all([
          db.saveAssignments(data.assignments),
          db.saveSettings(data.settings)
        ]);
        showToast('Dados importados com sucesso!', 'success');
    } catch (e) {
        console.error("Failed to import data:", e);
        showToast('Falha ao importar dados. Verifique o arquivo.', 'error');
        setAssignments(originalAssignments);
        setSettings(originalSettings);
    }
  };

  // Calculate people already assigned on the selected day, excluding the current role being edited
  const peopleAssignedOnDay = assignmentToEdit
    ? Object.entries(assignments[assignmentToEdit.date] || {})
        .filter(([role]) => role !== assignmentToEdit.role)
        .map(([, assignmentValue]) => (assignmentValue as AssignmentValue)?.person)
        .filter((person): person is string => !!person)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
        <svg className="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg">Carregando dados...</p>
      </div>
    );
  }

  return (
    <>
      <div className="app-container min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <Header />
          <WeekNavigator
            currentDate={currentDate}
            onPreviousWeek={() => handleDateChange(-7)}
            onNextWeek={() => handleDateChange(7)}
            onToday={() => setCurrentDate(new Date())}
            onOpenSettings={() => setSettingsModalOpen(true)}
            onOpenPrintExport={() => setPrintExportModalOpen(true)}
            onPreviewReport={() => setIsReportModalOpen(true)}
            isInstallable={!!installPromptEvent}
            onInstall={handleInstall}
          />
          <main>
            {meetingDates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-6">
                {meetingDates.map(date => {
                  const dateKey = date.toISOString().split('T')[0];
                  return (
                    <AssignmentCard
                      key={dateKey}
                      date={date}
                      assignments={assignments[dateKey] || {}}
                      onAssign={(role) => setAssignmentToEdit({ date: dateKey, role })}
                    />
                  );
                })}
              </div>
            ) : (
               <div className="text-center py-12 px-6 bg-gray-800 rounded-lg mt-6">
                  <h3 className="text-xl font-semibold text-white">Nenhum dia de reunião configurado para esta semana.</h3>
                  <p className="mt-2 text-gray-400">
                    Vá para as <button onClick={() => setSettingsModalOpen(true)} className="text-blue-400 hover:text-blue-300 font-semibold underline">configurações</button> para selecionar os dias da semana para as reuniões.
                  </p>
              </div>
            )}
          </main>
        </div>

        {assignmentToEdit && (
          <AssignmentModal
            isOpen={!!assignmentToEdit}
            onClose={() => setAssignmentToEdit(null)}
            onSave={handleSaveAssignment}
            assignmentToEdit={assignmentToEdit}
            people={settings.people}
            peopleAssignedOnDay={peopleAssignedOnDay}
            currentAssignment={assignments[assignmentToEdit.date]?.[assignmentToEdit.role]}
            lastAssignmentDates={lastAssignmentDates}
          />
        )}

        {isSettingsModalOpen && (
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setSettingsModalOpen(false)}
            onSave={handleSaveSettings}
            currentSettings={settings}
            onClearPastAssignments={handleClearPastAssignments}
            assignments={assignments}
            onImportData={handleImportData}
            showToast={showToast}
          />
        )}

        {isReportModalOpen && (
            <ReportPreviewModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                assignments={assignments}
                settings={settings}
                currentDate={currentDate}
            />
        )}

        {isPrintExportModalOpen && (
          <PrintExportModal 
            isOpen={isPrintExportModalOpen}
            onClose={() => setPrintExportModalOpen(false)}
            onPrint={handlePrepareAndPrint}
            onDownloadPdf={handleDownloadPDF}
            onDownloadPng={handleDownloadPNG}
          />
        )}
      </div>

      <div className="print-container">
        {printContent}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default App;
