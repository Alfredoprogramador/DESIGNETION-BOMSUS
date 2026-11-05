import React, { useMemo } from 'react';
import { Assignment } from '../types';
import { ROLES_ORDER, DAYS_OF_WEEK } from '../constants';

interface PrintListLayoutProps {
  assignments: Record<string, Assignment>;
  datesToPrint: Date[];
  title: string;
}

const PrintListLayout: React.FC<PrintListLayoutProps> = ({ assignments, datesToPrint, title }) => {
  const weekdayDates = useMemo(() => {
    return datesToPrint.filter(d => d.getDay() >= 1 && d.getDay() <= 5);
  }, [datesToPrint]);

  const weekendDates = useMemo(() => {
    return datesToPrint.filter(d => d.getDay() === 0 || d.getDay() === 6);
  }, [datesToPrint]);

  const renderCards = (dates: Date[], sectionTitle: string, badgeBg: string) => {
    const validDates = dates.filter(date => {
      const dateKey = date.toISOString().split('T')[0];
      const dayAssignments = assignments[dateKey] || {};
      return ROLES_ORDER.some(role => !!dayAssignments[role]?.person);
    });

    if (validDates.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-gray-300">
          <span className={`px-3 py-1 rounded text-xs font-bold uppercase text-white ${badgeBg}`}>
            {sectionTitle}
          </span>
        </div>
        <div className="space-y-4">
          {validDates.map(date => {
            const dateKey = date.toISOString().split('T')[0];
            const dayAssignments = assignments[dateKey] || {};
            const dayName = DAYS_OF_WEEK[date.getDay()];
            const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

            return (
              <div key={dateKey} className="print-list-card p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                <h3 className="font-bold text-lg text-gray-900 border-b border-gray-200 pb-2 mb-3">
                  {dayName}, {formattedDate}
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ROLES_ORDER.map(role => {
                    const assignment = dayAssignments[role];
                    if (!assignment?.person) return null;
                    
                    return (
                      <li key={role} className="flex items-center justify-between p-2 rounded bg-white border border-gray-200">
                        <span className="font-semibold text-gray-700">{role}:</span>
                        <span className="font-bold text-gray-900">
                          {assignment.person}
                          {assignment.note && <span className="assignment-note italic text-xs text-gray-500 ml-1">({assignment.note})</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-white text-black">
      <h1 className="text-3xl font-bold text-center mb-8">
        {title}
      </h1>
      {datesToPrint.length > 0 ? (
        <div>
          {renderCards(weekdayDates, "Dias de Semana", "bg-blue-600")}
          {renderCards(weekendDates, "Final de Semana", "bg-emerald-600")}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">Nenhuma reunião encontrada para este período.</p>
      )}
    </div>
  );
};

export default PrintListLayout;