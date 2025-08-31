// Fix timezone issues by forcing local timezone interpretation
export const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  
  // Split the date string and create date in local timezone
  const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
  return new Date(year, month - 1, day); // month is 0-indexed
};

export const getTodayLocalDate = () => {
  const today = new Date();
  // Create a new date with just year, month, day in local timezone
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export const isDateBeforeToday = (dateString) => { 
  try {
    if (!dateString) return false;
    
    const today = getTodayLocalDate();
    const serviceDate = parseLocalDate(dateString);
    
    if (!serviceDate || !today || isNaN(serviceDate.getTime()) || isNaN(today.getTime())) {
      return false; // If date parsing fails, assume it's NOT in the past
    }
    
    // 🔧 KEY FIX: Only consider it "before today" if it's clearly in the past
    const todayTime = today.getTime();
    const serviceDateTime = serviceDate.getTime();
    
    // Consider dates more than 12 hours ago as "past" to handle timezone edge cases
    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    
    return (todayTime - serviceDateTime) > twelveHoursInMs;
  } catch (error) {
    console.error('isDateBeforeToday error:', error);
    return false; // Default to NOT hiding services if there's an error
  }
};

export const isDateToday = (dateString) => {
  if (!dateString) return false;
  
  const today = getTodayLocalDate();
  const serviceDate = parseLocalDate(dateString);
  
  if (!serviceDate) return false;
  
  return serviceDate.getTime() === today.getTime();
};

export const formatDateLocal = (dateString) => {
  if (!dateString) return 'Non définie';
  
  const date = parseLocalDate(dateString);
  if (!date) return 'Date invalide';
  
  return date.toLocaleDateString('fr-TN');
};

// Get current date in YYYY-MM-DD format for forms
export const getCurrentDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};