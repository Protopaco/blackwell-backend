// Formats the current time as MMDD_HHmm for archive tab naming — e.g. "0626_1430".
const buildArchiveTimestamp = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${month}${day}_${hours}${minutes}`;
};

export default buildArchiveTimestamp;
