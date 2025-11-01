
import React from 'react';
import { Assignment, Role } from '../types';
import { ROLES_ORDER, DAYS_OF_WEEK } from '../constants';

interface AssignmentCardProps {
  date: Date;
  assignments: Assignment;
  onAssign: (role: Role) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ date, assignments, onAssign }) => {
  const dayName = DAYS_OF_WEEK[date.getDay()];
  const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="mb-4 text-center">
        <h3 className="text-2xl font-bold text-white">{dayName}</h3>
        <p className="text-gray-400">{formattedDate}</p>
      </div>
      <div className="space-y-3">
        {ROLES_ORDER.map(role => {
          const assignment = assignments[role];
          const hasAssignment = !!assignment?.person;

          return (
            <div key={role} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-md">
              <span className="text-gray-300 font-medium">{role}</span>
              <button
                onClick={() => onAssign(role)}
                title={assignment?.note || ''}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
                  hasAssignment
                    ? 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                }`}
              >
                {hasAssignment ? assignment.person : 'Designar'}
                {assignment?.note && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentCard;
