const TIMEZONE = 'America/New_York';

export const formatDateInET = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: TIMEZONE,
  });
};

export const formatDateOnlyInET = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: TIMEZONE,
  });
};

export const formatShortDateInET = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: TIMEZONE,
  });
};

export const formatShortDateWithYearInET = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: TIMEZONE,
  });
};

export const getCurrentDateInET = (): string => {
  const now = new Date();
  const etString = now.toLocaleString('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const [month, day, year] = etString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const getDateTimeLocalValueInET = (dateString: string): string => {
  const date = new Date(dateString);
  const etString = date.toLocaleString('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const [datePart, timePart] = etString.split(', ');
  const [month, day, year] = datePart.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
};

export const convertLocalDateTimeToUTC = (localDateTimeString: string): string => {
  const etDate = new Date(localDateTimeString);
  const utcDate = new Date(etDate.toLocaleString('en-US', { timeZone: 'UTC' }));

  const offset = etDate.getTime() - utcDate.getTime();
  const correctedDate = new Date(etDate.getTime() + offset);

  return correctedDate.toISOString();
};
