
import React from 'react';

interface WeekNavigatorProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onOpenSettings: () => void;
  onOpenPrintExport: () => void;
  onPreviewReport: () => void;
  isInstallable: boolean;
  onInstall: () => void;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onOpenSettings,
  onOpenPrintExport,
  onPreviewReport,
  isInstallable,
  onInstall,
}) => {
  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startMonth = start.toLocaleString('pt-BR', { month: 'short' });
    const endMonth = end.toLocaleString('pt-BR', { month: 'short' });

    if (startMonth === endMonth) {
      return `${start.getDate()} - ${end.getDate()} de ${startMonth.replace('.', '')}`;
    }
    return `${start.getDate()} de ${startMonth.replace('.', '')} - ${end.getDate()} de ${endMonth.replace('.', '')}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-gray-700 mb-6 sticky top-4 z-10 backdrop-blur-sm">
      <div className="flex items-center space-x-2 mb-3 sm:mb-0">
        <button
          onClick={onPreviousWeek}
          className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
          aria-label="Semana anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={onToday}
          className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          Hoje
        </button>
        <button
          onClick={onNextWeek}
          className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
          aria-label="Próxima semana"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <h2 className="text-lg font-semibold text-white order-first sm:order-none mb-3 sm:mb-0">{getWeekRange(currentDate)}</h2>
      <div className="flex items-center flex-wrap justify-center gap-2">
        {isInstallable && (
          <button
            onClick={onInstall}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            aria-label="Instalar aplicativo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>Instalar</span>
          </button>
        )}
        <button
            onClick={onPreviewReport}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
            aria-label="Pré-visualizar relatório do mês"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2 1h8v2H6V6zm2 4h4v2H8v-2z" clipRule="evenodd" />
            </svg>
            <span>Visualizar</span>
        </button>
        <button
          onClick={onOpenPrintExport}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
          aria-label="Imprimir ou exportar designações"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          <span>Imprimir / Exportar</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0l-.1.42a1.5 1.5 0 01-2.12.98l-.38-.18c-1.46-.7-3.13.43-2.95 2.01l.18.81a1.5 1.5 0 01-1.49 1.67l-.44.05c-1.6.17-1.6 2.47 0 2.64l.44.05a1.5 1.5 0 011.49 1.67l-.18.81c-.18 1.58 1.49 2.7 2.95 2.01l.38-.18a1.5 1.5 0 012.12.98l.1.42c.38 1.56 2.6 1.56 2.98 0l.1-.42a1.5 1.5 0 012.12-.98l.38.18c1.46.7 3.13-.43 2.95-2.01l-.18-.81a1.5 1.5 0 011.49-1.67l.44-.05c-1.6-.17 1.6-2.47 0-2.64l-.44-.05a1.5 1.5 0 01-1.49-1.67l.18-.81c.18-1.58-1.49-2.7-2.95-2.01l-.38.18a1.5 1.5 0 01-2.12-.98l-.1-.42zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span>Configurações</span>
        </button>
      </div>
    </div>
  );
};

export default WeekNavigator;
