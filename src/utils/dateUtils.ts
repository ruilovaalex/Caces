export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
};

export const getCurrentTimestamp = (): string => {
  return new Date().toLocaleString();
};
