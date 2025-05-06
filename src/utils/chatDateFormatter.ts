export const formatDate = (inputDate?: string): string => {
  if (!inputDate) return '';

  try {
    const [datePart] = inputDate.split(' ');
    if (!datePart) return inputDate; // Если не удалось извлечь часть с датой

    const dateComponents: string[]  = datePart.split('.');
    if (dateComponents.length !== 3) return inputDate; // Неправильный формат даты

    const day = parseInt(dateComponents[0] || '');
    const month = parseInt(dateComponents[1] || '');
    const year = parseInt(dateComponents[2] || '');

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return inputDate; // Не удалось преобразовать в числа
    }

    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
      return inputDate; // Некорректная дата
    }

    const now = new Date();
    const isCurrentYear = date.getFullYear() === now.getFullYear();

    const monthNames = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    const monthNamesNominative = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];

    const monthIndex = date.getMonth();
    if (monthIndex < 0 || monthIndex > 11) {
      return inputDate; // Некорректный месяц
    }

    return isCurrentYear
      ? `${day} ${monthNames[monthIndex]}`
      : `${monthNamesNominative[monthIndex]} ${year}`;
  } catch (e) {
    console.error('Error formatting date:', e);
    return inputDate;
  }
}
