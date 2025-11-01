
import React, { useMemo } from 'react';
import { Assignment, Settings } from '../types';
import { ROLES_ORDER, DAYS_OF_WEEK } from '../constants';

interface PrintLayoutProps {
  assignments: Record<string, Assignment>;
  datesToPrint: Date[];
  title: string;
  settings: Settings;
}

// HEX color palette that matches the Tailwind CSS classes in ReportPreviewModal.tsx
// This ensures visual consistency between the preview and the export.
const PREVIEW_COLOR_PALETTE_HEX = [
  { bg: '#bfdbfe', text: '#1e3a8a' }, // bg-blue-200, text-blue-900
  { bg: '#bbf7d0', text: '#14532d' }, // bg-green-200, text-green-900
  { bg: '#fef08a', text: '#713f12' }, // bg-yellow-200, text-yellow-900
  { bg: '#e9d5ff', text: '#581c87' }, // bg-purple-200, text-purple-900
  { bg: '#fbcfe8', text: '#831843' }, // bg-pink-200, text-pink-900
  { bg: '#c7d2fe', text: '#312e81' }, // bg-indigo-200, text-indigo-900
  { bg: '#99f6e4', text: '#134e4a' }, // bg-teal-200, text-teal-900
  { bg: '#fecaca', text: '#7f1d1d' }, // bg-red-200, text-red-900
  { bg: '#fed7aa', text: '#7c2d12' }, // bg-orange-200, text-orange-900
  { bg: '#d9f99d', text: '#365314' }, // bg-lime-200, text-lime-900
  { bg: '#a5f3fc', text: '#164e63' }, // bg-cyan-200, text-cyan-900
  { bg: '#a7f3d0', text: '#064e3b' }, // bg-emerald-200, text-emerald-900
];

const PrintLayout: React.FC<PrintLayoutProps> = ({ assignments, datesToPrint, title, settings }) => {
  const personColorMap = useMemo(() => {
    const map: Record<string, { bg: string; text: string }> = {};
    const sortedPeople = [...settings.people].sort((a, b) => a.localeCompare(b));
    sortedPeople.forEach((person, index) => {
      map[person] = PREVIEW_COLOR_PALETTE_HEX[index % PREVIEW_COLOR_PALETTE_HEX.length];
    });
    return map;
  }, [settings.people]);

  return (
    <div style={{ padding: '24px', backgroundColor: '#1f2937', color: '#d1d5db', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#ffffff', fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>
        {title}
      </h1>
      {datesToPrint.length > 0 ? (
        <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', fontWeight: '600', borderBottom: '2px solid #4b5563', whiteSpace: 'nowrap' }}>Data</th>
              {ROLES_ORDER.map(role => (
                <th key={role} style={{ padding: '12px', fontWeight: '600', borderBottom: '2px solid #4b5563', whiteSpace: 'nowrap' }}>{role}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datesToPrint.map((date, index) => {
              const dateKey = date.toISOString().split('T')[0];
              const dayAssignments = assignments[dateKey] || {};
              const dayName = DAYS_OF_WEEK[date.getDay()];
              const formattedDay = date.toLocaleDateString('pt-BR', { day: '2-digit' });
              const monthName = date.toLocaleString('pt-BR', { month: 'long' });

              // Mimics the 'divide-y' behavior from Tailwind
              const trStyle: React.CSSProperties = index > 0 ? { borderTop: '1px solid #374151' } : {};

              return (
                <tr key={dateKey} style={trStyle}>
                  <td style={{ padding: '12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', color: '#ffffff' }}>{dayName}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {formattedDay} de {monthName.toLocaleLowerCase()}
                      </span>
                    </div>
                  </td>
                  {ROLES_ORDER.map(role => {
                    const assignment = dayAssignments[role];
                    const colorStyles = assignment?.person ? personColorMap[assignment.person] : null;

                    return (
                      <td key={role} style={{ padding: '12px', verticalAlign: 'top' }}>
                        {assignment?.person && colorStyles ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'inline-block',
                              backgroundColor: colorStyles.bg,
                              color: colorStyles.text,
                            }}>
                              {assignment.person}
                            </span>
                            {assignment.note && (
                              <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#9ca3af', marginTop: '4px', maxWidth: '150px', whiteSpace: 'normal' }}>
                                ({assignment.note})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontFamily: 'monospace', color: '#6b7280' }}>---</span>
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
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>Nenhuma reunião encontrada para este período.</p>
      )}
    </div>
  );
};

export default PrintLayout;
