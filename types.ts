
export enum Role {
  PRESIDENCIA = 'Presidência',
  LEITURA = 'Leitura',
  ORACAO_FINAL = 'Oração Final',
  PALCO = 'Palco',
  AUDIO_VIDEO = 'Áudio & Vídeo',
  INDICADOR_1 = 'Indicador 1',
  INDICADOR_2 = 'Indicador 2',
  MICROFONE_1 = 'Microfone Volante 1',
  MICROFONE_2 = 'Microfone Volante 2',
}

export type AssignmentValue = {
  person: string;
  note?: string;
};

export type Assignment = {
  [key in Role]?: AssignmentValue;
};

export interface Settings {
  meetingDays: number[];
  people: string[];
}
