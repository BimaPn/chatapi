const formatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});

export const dateToTime = (date) => {
  return formatter.format(date);
}
export const dateToYMD = (date) => {
  const year = date.getFullYear(); 
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`
}
