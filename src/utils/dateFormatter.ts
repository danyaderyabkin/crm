export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

export const formatDateRange = (start: Date | string, end?: Date | string): string => {
  const startStr = formatDate(start)
  return end ? `${startStr} - ${formatDate(end)}` : startStr
}
