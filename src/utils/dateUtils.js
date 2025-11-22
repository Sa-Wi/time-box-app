
export const calculateTimeDifference = (start, end, unit) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  switch (unit) {
    case 'day':
      return diffDays;
    case 'week':
      return Math.ceil(diffDays / 7);
    case 'month':
      return (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    case 'year':
      return endDate.getFullYear() - startDate.getFullYear();
    default:
      return 0;
  }
};

export const getPassedTime = (start, unit) => {
  const startDate = new Date(start);
  const now = new Date();
  
  if (now < startDate) return 0;

  return calculateTimeDifference(start, now, unit);
};
