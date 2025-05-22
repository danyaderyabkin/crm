export const formatDate = (inputDate?: string): string => {
  if (!inputDate) return '';

  try {
    const [datePart, timePart] = inputDate.split(' ');
    if (!datePart || !timePart) return inputDate;

    let day: number, month: number, year: number;

    // Обработка формата YYYY-MM-DD
    if (datePart.includes('-')) {
      const parts = datePart.split('-');
      if (parts.length !== 3) return inputDate;

      const [y, m, d] = parts.map(Number);
      if (isNaN(y) || isNaN(m) || isNaN(d)) return inputDate;

      year = y;
      month = m;
      day = d;
    }
    // Обработка формата DD.MM.YYYY
    else if (datePart.includes('.')) {
      const parts = datePart.split('.');
      if (parts.length !== 3) return inputDate;

      const [d, m, y] = parts.map(Number);
      if (isNaN(d) || isNaN(m) || isNaN(y)) return inputDate;

      year = y;
      month = m;
      day = d;
    }
    else {
      return inputDate;
    }

    // Дальнейшая обработка даты...
    const messageDate = new Date(year, month - 1, day);
    if (isNaN(messageDate.getTime())) return inputDate;

    const now = new Date();
    const isToday = messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear();

    if (isToday) {
      const [hours, minutes] = timePart.split(':');
      return hours && minutes ? `${hours}:${minutes}` : inputDate;
    }

    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = month.toString().padStart(2, '0');
    const shortYear = year.toString().slice(-2);

    return `${formattedDay}.${formattedMonth}.${shortYear}`;
  } catch (e) {
    console.error('Error formatting date:', e);
    return inputDate;
  }
};
