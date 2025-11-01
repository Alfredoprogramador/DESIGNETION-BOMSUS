
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
  { bg: 'bg-blue-200', text: 'text-blue-900' },
  { bg: 'bg-green-200', text: 'text-green-900' },
  { bg: 'bg-yellow-200', text: 'text-yellow-900' },
  { bg: 'bg-purple-200', text: 'text-purple-900' },
  { bg: 'bg-pink-200', text: 'text-pink-900' },
  { bg: 'bg-indigo-200', text: 'text-indigo-900' },
  { bg: 'bg-teal-200', text: 'text-teal-900' },
  { bg: 'bg-red-200', text: 'text-red-900' },
  { bg: 'bg-orange-200', text: 'text-orange-900' },
  { bg: 'bg-lime-200', text: 'text-lime-900' },
  { bg: 'bg-cyan-200', text: 'text-cyan-900' },
  { bg: 'bg-emerald-200', text: 'text-emerald-900' },
];


const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ isOpen, onClose, assignments, currentDate, settings }) => {
  if (!isOpen) return null;
  
  const personColorMap = useMemo(() => {
    const map: Record<string, { bg: string, text: string }> = {};
    const sortedPeople = [...settings.people].sort((a, b) => a.localeCompare(b));
    sortedPeople.forEach((person, index) => {
      map[person] = COLOR_PALETTE[index % COLOR_PALETTE.length];
    });
    return map;
  }, [settings.people]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });

  const getMeetingDatesForMonth = () => {
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

  const meetingDates = getMeetingDatesForMonth();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl p-6 border border-gray-700 h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">
            Pré-visualização do Relatório: <span className="text-blue-400">{monthName.charAt(0).toUpperCase() + monthName.slice(1)} de {year}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Fechar pré-visualização">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-auto flex-grow">
          {meetingDates.length > 0 ? (
             <table className="w-full min-w-[1200px] text-sm text-left text-gray-300 border-collapse">
                <thead className="sticky top-0 bg-gray-800 z-10">
                    <tr>
                        <th scope="col" className="p-3 font-semibold border-b-2 border-gray-600">Data</th>
                        {ROLES_ORDER.map(role => (
                            <th scope="col" key={role} className="p-3 font-semibold border-b-2 border-gray-600 whitespace-nowrap">{role}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {meetingDates.map(date => {
                        const dateKey = date.toISOString().split('T')[0];
                        const dayAssignments = assignments[dateKey] || {};
                        const dayName = DAYS_OF_WEEK[date.getDay()];
                        const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit' });

                        return (
                            <tr key={dateKey} className="hover:bg-gray-700/50 transition-colors">
                                <td className="p-3 font-semibold text-white whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span>{dayName}</span>
                                        <span className="text-xs text-gray-400">{formattedDate} de {monthName.toLocaleLowerCase()}</span>
                                    </div>
                                </td>
                                {ROLES_ORDER.map(role => {
                                    const assignment = dayAssignments[role];
                                    const colorClasses = assignment?.person ? personColorMap[assignment.person] : null;

                                    return (
                                        <td key={role} className="p-3 align-top">
                                            {assignment?.person && colorClasses ? (
                                                <div className="flex flex-col items-start">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold inline-block ${colorClasses.bg} ${colorClasses.text}`}>
                                                        {assignment.person}
                                                    </span>
                                                    {assignment.note && (
                                                        <span className="text-xs text-gray-400 italic mt-1 max-w-[150px] whitespace-normal">({assignment.note})</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 font-mono">---</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
          ) : (
             <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-500 py-10 text-lg">Nenhuma reunião encontrada para este mês.</p>
            </div>
          )}
        </div>

         <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 font-semibold transition"
            >
              Fechar
            </button>
          </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
