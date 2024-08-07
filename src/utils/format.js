
export const formatDate = (date, offset) => {
  let currentDate = date || new Date()
  if (offset)
    currentDate.setDate(currentDate.getDate() + offset);
  var year = currentDate.getFullYear();
  var month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  var day = currentDate.getDate().toString().padStart(2, '0');
  var formattedDate = `${year}-${month}-${day}`;
  return formattedDate
}
export const formatDateTime = (date, offset) => {
  let currentDate = date || new Date()
  if (offset)
    currentDate.setDate(currentDate.getDate() + offset);
  let year = currentDate.getFullYear()
  let month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
  let day = currentDate.getDate().toString().padStart(2, '0')
  let hours = currentDate.getHours().toString().padStart(2, '0')
  let minutes = currentDate.getMinutes().toString().padStart(2, '0')
  let seconds = currentDate.getSeconds().toString().padStart(2, '0')
  let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  return formattedDate
} 

export const yearsPassed = (date) => {
  if (!date) return 0;
  
  const inputDate = new Date(date);
  const currentDate = new Date();
  
  let years = currentDate.getFullYear() - inputDate.getFullYear();
  
  // 检查月份和日期，以确定是否需要减少一年
  const monthDifference = currentDate.getMonth() - inputDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < inputDate.getDate())) {
    years--;
  }
  
  return years;
} 