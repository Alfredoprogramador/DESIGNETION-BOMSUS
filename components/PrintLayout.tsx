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
const PREVIEW_COLOR_PALETTE_HEX = [
  { bg: '#bfdbfe', text: '#1e3a8a', border: '#60a5fa' }, // blue
  { bg: '#bbf7d0', text: '#14532d', border: '#4ade80' }, // green
  { bg: '#fef08a', text: '#713f12', border: '#facc15' }, // yellow
  { bg: '#e9d5ff', text: '#581c87', border: '#c084fc' }, // purple
  { bg: '#fbcfe8', text: '#831843', border: '#f472b6' }, // pink
  { bg: '#c7d2fe', text: '#312e81', border: '#818cf8' }, // indigo
  { bg: '#99f6e4', text: '#134e4a', border: '#2dd4bf' }, // teal
  { bg: '#fecaca', text: '#7f1d1d', border: '#f87171' }, // red
  { bg: '#fed7aa', text: '#7c2d12', border: '#fb923c' }, // orange
  { bg: '#d9f99d', text: '#365314', border: '#a3e635' }, // lime
  { bg: '#a5f3fc', text: '#164e63', border: '#38bdf8' }, // cyan
  { bg: '#a7f3d0', text: '#064e3b', border: '#34d399' }, // emerald
];

const PrintLayout: React.FC<PrintLayoutProps> = ({ assignments, datesToPrint, title, settings }) => {
  const personColorMap = useMemo(() => {
    const map: Record<string, { bg: string; text: string; border: string }> = {};
    const sortedPeople = [...settings.people].sort((a, b) => a.localeCompare(b));
    sortedPeople.forEach((person, index) => {
      map[person] = PREVIEW_COLOR_PALETTE_HEX[index % PREVIEW_COLOR_PALETTE_HEX.length];
    });
    return map;
  }, [settings.people]);

  // Dividir as datas em Dias de Semana e Final de Semana
  const weekdayDates = useMemo(() => {
    return datesToPrint.filter(d => d.getDay() >= 1 && d.getDay() <= 5);
  }, [datesToPrint]);

  const weekendDates = useMemo(() => {
    return datesToPrint.filter(d => d.getDay() === 0 || d.getDay() === 6);
  }, [datesToPrint]);

  const renderSectionTable = (dates: Date[], sectionTitle: string, bannerBg: string, borderColor: string) => {
    if (dates.length === 0) return null;

    return (
      <div style={{ marginBottom: '32px' }}>
        {/* Banner do Título da Seção */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: `2px solid ${borderColor}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              backgroundColor: bannerBg, 
              color: '#ffffff', 
              padding: '6px 14px', 
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {sectionTitle}
            </span>
            <span style={{ color: '#d1d5db', fontSize: '0.9rem', fontWeight: '600' }}>
              Escala de Designações
            </span>
          </div>
          <span style={{ 
            color: '#9ca3af', 
            fontSize: '0.75rem', 
            padding: '4px 10px', 
            borderRadius: '9999px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563'
          }}>
            {dates.length} {dates.length === 1 ? 'reunião' : 'reuniões'}
          </span>
        </div>

        {/* Tabela com linhas destacadas separando todos os nomes */}
        <div style={{ 
          overflowX: 'auto', 
          borderRadius: '8px', 
          border: `2px solid ${borderColor}`,
          backgroundColor: '#111827'
        }}>
          <table style={{ 
            width: '100%', 
            minWidth: '1200px', 
            borderCollapse: 'collapse', 
            fontSize: '0.875rem', 
            textAlign: 'left' 
          }}>
            <thead>
              <tr style={{ backgroundColor: '#1f2937' }}>
                <th style={{ 
                  padding: '12px', 
                  fontWeight: '700', 
                  borderBottom: `2px solid ${borderColor}`,
                  borderRight: `2px solid ${borderColor}`,
                  color: '#f3f4f6',
                  textAlign: 'center',
                  width: '180px',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em'
                }}>
                  Data
                </th>
                {ROLES_ORDER.map(role => (
                  <th 
                    key={role} 
                    style={{ 
                      padding: '12px', 
                      fontWeight: '700', 
                      borderBottom: `2px solid ${borderColor}`,
                      borderRight: `2px solid ${borderColor}`,
                      color: '#f3f4f6',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date, index) => {
                const dateKey = date.toISOString().split('T')[0];
                const dayAssignments = assignments[dateKey] || {};
                const dayName = DAYS_OF_WEEK[date.getDay()];
                const formattedDay = date.toLocaleDateString('pt-BR', { day: '2-digit' });
                const monthName = date.toLocaleString('pt-BR', { month: 'long' });
                const isEven = index % 2 === 0;

                return (
                  <tr 
                    key={dateKey} 
                    style={{ 
                      backgroundColor: isEven ? '#1f2937' : '#182234',
                      borderBottom: `2px solid ${borderColor}`
                    }}
                  >
                    {/* Célula de Data com borda direita destacada */}
                    <td style={{ 
                      padding: '12px', 
                      verticalAlign: 'middle', 
                      whiteSpace: 'nowrap',
                      borderRight: `2px solid ${borderColor}`,
                      backgroundColor: '#1f2937',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', color: '#60a5fa', fontSize: '0.875rem' }}>{dayName}</span>
                        <span style={{ fontSize: '0.75rem', color: '#d1d5db', marginTop: '2px' }}>
                          {formattedDay} de {monthName.toLowerCase()}
                        </span>
                      </div>
                    </td>

                    {/* Células de Nomes com bordas destacadas separando cada pessoa */}
                    {ROLES_ORDER.map(role => {
                      const assignment = dayAssignments[role];
                      const colorStyles = assignment?.person ? personColorMap[assignment.person] : null;

                      return (
                        <td 
                          key={role} 
                          style={{ 
                            padding: '10px 12px', 
                            verticalAlign: 'middle',
                            borderRight: `2px solid ${borderColor}`,
                            textAlign: 'center'
                          }}
                        >
                          {assignment?.person && colorStyles ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                display: 'inline-block',
                                backgroundColor: colorStyles.bg,
                                color: colorStyles.text,
                                border: `1px solid ${colorStyles.border}`,
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                              }}>
                                {assignment.person}
                              </span>
                              {assignment.note && (
                                <span style={{ 
                                  fontSize: '0.7rem', 
                                  fontStyle: 'italic', 
                                  color: '#cbd5e1', 
                                  marginTop: '4px', 
                                  maxWidth: '150px', 
                                  whiteSpace: 'normal',
                                  textAlign: 'center' 
                                }}>
                                  ({assignment.note})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontFamily: 'monospace', color: '#6b7280', fontSize: '0.75rem' }}>---</span>
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
    <div style={{ padding: '24px', backgroundColor: '#111827', color: '#d1d5db', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#ffffff', fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>
        {title}
      </h1>

      {datesToPrint.length > 0 ? (
        <div>
          {/* 1. Tabela de Dias de Semana */}
          {renderSectionTable(
            weekdayDates,
            "Dias de Semana",
            "#2563eb", // blue-600
            "#4b5563"  // gray-600
          )}

          {/* 2. Tabela de Final de Semana */}
          {renderSectionTable(
            weekendDates,
            "Final de Semana",
            "#059669", // emerald-600
            "#4b5563"  // gray-600
          )}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
          Nenhuma reunião encontrada para este período.
        </p>
      )}
    </div>
  );
};

export default PrintLayout;
