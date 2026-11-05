import React, { useMemo } from 'react';
import { Assignment, Settings } from '../types';
import { ROLES_ORDER, DAYS_OF_WEEK } from '../constants';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: Record<string, Assignment>;
  currentDate: Date;
  settings: Settings;
}

// Paleta de cores para as etiquetas de identificação
const COLOR_PALETTE = [
  { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-400' },
  { bg: 'bg-green-200', text: 'text-green-900', border: 'border-green-400' },
  { bg: 'bg-yellow-200', text: 'text-yellow-900', border: 'border-yellow-400' },
  { bg: 'bg-purple-200', text: 'text-purple-900', border: 'border-purple-400' },
  { bg: 'bg-pink-200', text: 'text-pink-900', border: 'border-pink-400' },
  { bg: 'bg-indigo-200', text: 'text-indigo-900', border: 'border-indigo-400' },
  { bg: 'bg-teal-200', text: 'text-teal-900', border: 'border-teal-400' },
  { bg: 'bg-red-200', text: 'text-red-900', border: 'border-red-400' },
  { bg: 'bg-orange-200', text: 'text-orange-900', border: 'border-orange-400' },
  { bg: 'bg-lime-200', text: 'text-lime-900', border: 'border-lime-400' },
  { bg: 'bg-cyan-200', text: 'text-cyan-900', border: 'border-cyan-400' },
  { bg: 'bg-emerald-200', text: 'text-emerald-900', border: 'border-emerald-400' },
];

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  assignments, 
  currentDate, 
  settings 
}) => {
  if (!isOpen) return null;
  
  const personColorMap = useMemo(() => {
    const map: Record<string, { bg: string; text: string; border: string }> = {};
    const sortedPeople = [...settings.people].sort((a, b) => a.localeCompare(b));
    sortedPeople.forEach((person, index) => {
      map[person] = COLOR_PALETTE[index % COLOR_PALETTE.length];
    });
    return map;
  }, [settings.people]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });

  const meetingDates = useMemo(() => {
    const dates: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      if (settings.meetingDays.includes(date.getDay())) {
        dates.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }, [year, month, settings.meetingDays]);

  // Dividir as reuniões entre Dias de Semana (Seg-Sex) e Final de Semana (Sáb-Dom)
  const weekdayDates = useMemo(() => {
    return meetingDates.filter(d => d.getDay() >= 1 && d.getDay() <= 5);
  }, [meetingDates]);

  const weekendDates = useMemo(() => {
    return meetingDates.filter(d => d.getDay() === 0 || d.getDay() === 6);
  }, [meetingDates]);

  const renderScheduleTable = (
    dates: Date[], 
    title: string, 
    badgeBg: string, 
    badgeText: string,
    accentBorder: string
  ) => {
    if (dates.length === 0) return null;

    return (
      <div className="mb-10 last:mb-0">
        {/* Título de Destaque da Tabela */}
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b-2 border-gray-700">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${badgeBg} ${badgeText}`}>
              {title}
            </span>
            <span className="text-sm font-semibold text-gray-300">
              Escala de Reuniões
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-700/80 text-gray-300 border border-gray-600">
            {dates.length} {dates.length === 1 ? 'reunião' : 'reuniões'}
          </span>
        </div>

        {/* Tabela com linhas destacadas separando todos os nomes */}
        <div className={`overflow-x-auto rounded-lg border-2 ${accentBorder} shadow-xl bg-gray-900`}>
          <table className="w-full min-w-[1200px] text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                {/* Coluna de Data com borda destacada */}
                <th 
                  scope="col" 
                  className="p-3 font-bold border-b-2 border-r-2 border-gray-600 bg-gray-800 text-center w-48 text-xs uppercase tracking-wider text-gray-200"
                >
                  Data
                </th>
                {/* Colunas das Designações com bordas verticais visíveis */}
                {ROLES_ORDER.map((role) => (
                  <th 
                    scope="col" 
                    key={role} 
                    className="p-3 font-bold border-b-2 border-r-2 border-gray-600 whitespace-nowrap text-center bg-gray-800 text-xs uppercase tracking-wider text-gray-200 last:border-r-0"
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date, idx) => {
                const dateKey = date.toISOString().split('T')[0];
                const dayAssignments = assignments[dateKey] || {};
                const dayName = DAYS_OF_WEEK[date.getDay()];
                const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit' });
                const isEven = idx % 2 === 0;

                return (
                  <tr 
                    key={dateKey} 
                    className={`${isEven ? 'bg-gray-800/90' : 'bg-gray-850'} hover:bg-gray-700/60 transition-colors border-b-2 border-gray-600 last:border-b-0`}
                  >
                    {/* Célula de Data com borda dupla vertical à direita */}
                    <td className="p-3 font-semibold text-white whitespace-nowrap border-r-2 border-gray-600 bg-gray-800/95">
                      <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-bold text-blue-400">{dayName}</span>
                        <span className="text-xs text-gray-300 font-medium">{formattedDate} de {monthName.toLowerCase()}</span>
                      </div>
                    </td>

                    {/* Células de Nomes com linhas destacadas (borda lateral e inferior sólidas) */}
                    {ROLES_ORDER.map((role) => {
                      const assignment = dayAssignments[role];
                      const colorClasses = assignment?.person ? personColorMap[assignment.person] : null;

                      return (
                        <td 
                          key={role} 
                          className="p-3 align-middle border-r-2 border-gray-600 last:border-r-0 text-center"
                        >
                          {assignment?.person && colorClasses ? (
                            <div className="flex flex-col items-center justify-center">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-block shadow-sm border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}>
                                {assignment.person}
                              </span>
                              {assignment.note && (
                                <span className="text-[11px] text-gray-300 italic mt-1 max-w-[150px] whitespace-normal">
                                  ({assignment.note})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 font-mono text-xs select-none">---</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl p-6 border-2 border-gray-700 h-[92vh] flex flex-col">
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>Pré-visualização do Relatório:</span>
              <span className="text-blue-400 capitalize">{monthName} de {year}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Tabelas divididas entre Dias de Semana e Final de Semana com linhas delimitadoras destacadas.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition" 
            aria-label="Fechar pré-visualização"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Conteúdo com as duas tabelas divididas */}
        <div className="overflow-auto flex-grow pr-1 custom-scrollbar">
          {meetingDates.length > 0 ? (
            <div className="space-y-4">
              {/* 1. Tabela de Dias de Semana */}
              {renderScheduleTable(
                weekdayDates,
                "Dias de Semana",
                "bg-blue-600 text-white",
                "text-white",
                "border-blue-500/80"
              )}

              {/* 2. Tabela de Final de Semana */}
              {renderScheduleTable(
                weekendDates,
                "Final de Semana",
                "bg-emerald-600 text-white",
                "text-white",
                "border-emerald-500/80"
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-gray-400 py-12 text-lg">
                Nenhuma reunião encontrada para este mês.
              </p>
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700 flex-shrink-0">
          <div className="text-xs text-gray-400">
            Total de {meetingDates.length} reuniões no mês ({weekdayDates.length} dias de semana, {weekendDates.length} finais de semana)
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-semibold transition flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-semibold transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
