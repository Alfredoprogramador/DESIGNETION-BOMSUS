import { Role } from './types';

export const ROLES_ORDER: Role[] = [
  Role.PRESIDENCIA,
  Role.LEITURA,
  Role.ORACAO_FINAL,
  Role.PALCO,
  Role.AUDIO_VIDEO,
  Role.INDICADOR_1,
  Role.INDICADOR_2,
  Role.MICROFONE_1,
  Role.MICROFONE_2,
];

export const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const RESTRICTIONS: { [key: string]: Role[] } = {
  '!': [Role.PRESIDENCIA, Role.LEITURA, Role.ORACAO_FINAL],
  '*': [Role.PRESIDENCIA, Role.ORACAO_FINAL],
  '"': [Role.ORACAO_FINAL],
};
