import { UnprocessableError } from '#utils/errors.js';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const validateIsoDateString = (value: string, fieldName = 'date'): void => {
  if (!ISO_DATE_REGEX.test(value)) {
    throw new UnprocessableError(`${fieldName} must be a valid YYYY-MM-DD date`);
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isValidCalendarDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isValidCalendarDate) {
    throw new UnprocessableError(`${fieldName} must be a valid YYYY-MM-DD date`);
  }
};

export default validateIsoDateString;
