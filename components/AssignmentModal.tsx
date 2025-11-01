
import React, { useState, useEffect, useMemo } from 'react';
import { AssignmentValue, Role } from '../types';
import { RESTRICTIONS } from '../constants';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: string, role: Role, person: string, note: string) => void;
  assignmentToEdit: { date: string; role: Role };
  people: string[];
  peopleAssignedOnDay: string[];
  currentAssignment?: AssignmentValue;
  lastAssignmentDates: Map<string, string>;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assignmentToEdit,
  people,
  peopleAssignedOnDay,
  currentAssignment,
  lastAssignmentDates,
}) => {
  const [selectedPerson, setSelectedPerson] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (currentAssignment) {
      setSelectedPerson(currentAssignment.person);
      setNote(currentAssignment.note || '');
    } else {
      setSelectedPerson('');
      setNote('');
    }
  }, [currentAssignment]);
  
  const availablePeople = useMemo(() => {
    const currentRole = assignmentToEdit.role;
    return people.filter(person => {
      const lastChar = person.slice(-1);

      if (Object.keys(RESTRICTIONS).includes(lastChar)) {
        const allowedRoles = RESTRICTIONS[lastChar as keyof typeof RESTRICTIONS];
        return allowedRoles.includes(currentRole);
      }
      
      return true;
    });
  }, [people, assignmentToEdit.role]);

  const isAlreadyAssigned = useMemo(() => 
    peopleAssignedOnDay.includes(selectedPerson) && selectedPerson !== '',
  [peopleAssignedOnDay, selectedPerson]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(assignmentToEdit.date, assignmentToEdit.role, selectedPerson, note);
  };
  
  const handleClear = () => {
    setSelectedPerson('');
    setNote('');
    onSave(assignmentToEdit.date, assignmentToEdit.role, '', '');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Designar para <span className="text-blue-400">{assignmentToEdit.role}</span></h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Fechar modal">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div className="mb-4">
            <label htmlFor="person-select" className="block text-sm font-medium text-gray-300 mb-2">Selecione uma pessoa</label>
            <select
              id="person-select"
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Ninguém --</option>
              {availablePeople.sort((a,b) => a.localeCompare(b)).map(person => {
                const isAssignedOnThisDay = peopleAssignedOnDay.includes(person);
                const lastAssignmentDateStr = lastAssignmentDates.get(person);

                let isRecent = false;
                let labelText = person;

                if (lastAssignmentDateStr) {
                    const lastDate = new Date(lastAssignmentDateStr);
                    const currentDate = new Date(assignmentToEdit.date);
                    
                    lastDate.setUTCHours(0, 0, 0, 0);
                    currentDate.setUTCHours(0, 0, 0, 0);

                    const timeDiff = currentDate.getTime() - lastDate.getTime();
                    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                    if (dayDiff > 0 && dayDiff <= 14) {
                        isRecent = true;
                    }

                    const formattedDate = new Date(lastAssignmentDateStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    labelText = `${person} (Última vez: ${formattedDate})`;
                }

                if (isAssignedOnThisDay) {
                    labelText += ' (já designado)';
                }

                return (
                    <option 
                        key={person} 
                        value={person} 
                        disabled={isAssignedOnThisDay}
                        className={isRecent ? 'text-yellow-400 font-semibold' : ''}
                    >
                        {isRecent ? '⚠️ ' : ''}{labelText}
                    </option>
                );
              })}
            </select>
            {isAlreadyAssigned && (
              <div className="mt-3 p-3 bg-yellow-900/50 border border-yellow-700 rounded-md text-yellow-300 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.636-1.1 2.226-1.1 2.862 0l5.517 9.555c.636 1.1-.159 2.484-1.431 2.484H4.17c-1.272 0-2.067-1.384-1.431-2.484l5.518-9.555zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span>Esta pessoa já foi designada para outra função neste dia.</span>
              </div>
            )}
        </div>
        
        <div className="mb-6">
            <label htmlFor="note-input" className="block text-sm font-medium text-gray-300 mb-2">Notas (opcional)</label>
            <input
              id="note-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Trazer microfone extra"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-semibold transition"
          >
            Limpar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 font-semibold transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isAlreadyAssigned}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;