
import React from 'react';
import { Assignment } from '../types';
import { ROLES_ORDER, DAYS_OF_WEEK } from '../constants';

interface PrintListLayoutProps {
  assignments: Record<string, Assignment>;
  datesToPrint: Date[];
  title: string;
}

const PrintListLayout: React.FC<PrintListLayoutProps> = ({ assignments, datesToPrint, title }) => {
  return (
    <div className="p-8 bg-white text-black">
      <h1 className="text-3xl font-bold text-center mb-8">
        {title}
      </h1>
      {datesToPrint.length > 0 ? (
        <div>
          {datesToPrint.map(date => {
            const dateKey = date.toISOString().split('T')[0];
            const dayAssignments = assignments[dateKey] || {};
            const dayName = DAYS_OF_WEEK[date.getDay()];
            const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

            const hasAssignments = ROLES_ORDER.some(role => !!dayAssignments[role]?.person);

            if (!hasAssignments) return null;

            return (
              <div key={dateKey} className="print-list-card">
                <h3>{dayName}, {formattedDate}</h3>
                <ul>
                  {ROLES_ORDER.map(role => {
                    const assignment = dayAssignments[role];
                    if (!assignment?.person) return null;
                    
                    return (
                      <li key={role}>
                        <strong>{role}:</strong> {assignment.person}
                        {assignment.note && <span className="assignment-note italic text-sm"> ({assignment.note})</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">Nenhuma reunião encontrada para este período.</p>
      )}
    </div>
  );
};

export default PrintListLayout;