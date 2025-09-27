import { DateTime } from 'luxon';

const TIMEZONE_BAHIA = 'America/Bahia';
const TIMEZONE_SAO_PAULO = 'America/Sao_Paulo';

/**
 * Converte horário local (Bahia) para UTC para salvar no banco
 */
export const convertToUTC = (dateStr: string, timeStr: string): string => {
  const localDateTime = DateTime.fromFormat(
    `${dateStr} ${timeStr}`, 
    'yyyy-MM-dd HH:mm', 
    { zone: TIMEZONE_BAHIA }
  );
  return localDateTime.toUTC().toISO()!;
};

/**
 * Converte UTC do banco para horário local (São Paulo) para exibir
 */
export const convertFromUTC = (utcIsoString: string): { date: string; time: string } => {
  const localDateTime = DateTime.fromISO(utcIsoString, { zone: 'utc' })
    .setZone(TIMEZONE_SAO_PAULO);
  
  return {
    date: localDateTime.toFormat('yyyy-MM-dd'),
    time: localDateTime.toFormat('HH:mm')
  };
};

/**
 * Formata data/hora para exibição em português
 */
export const formatDateTimeBR = (utcIsoString: string): string => {
  const localDateTime = DateTime.fromISO(utcIsoString, { zone: 'utc' })
    .setZone(TIMEZONE_SAO_PAULO);
  
  return localDateTime.toFormat('dd/MM/yyyy HH:mm');
};

/**
 * Calcula horário de fim baseado no início e duração
 */
export const calculateEndTime = (startUtc: string, durationMinutes: number): string => {
  const startDateTime = DateTime.fromISO(startUtc, { zone: 'utc' });
  return startDateTime.plus({ minutes: durationMinutes }).toISO()!;
};