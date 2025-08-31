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
  console.log('🔍 DEBUG isDateBeforeToday called with:', dateString);
  
  if (!dateString) {
    console.log('❌ No dateString provided, returning false');
    return false;
  }
  
  const today = getTodayLocalDate();
  const serviceDate = parseLocalDate(dateString);
  
  console.log('📅 Today (local):', today);
  console.log('📅 Service date:', serviceDate);
  console.log('⏰ Current time:', new Date().toString());
  console.log('⏰ Current hour:', new Date().getHours());
  
  if (!serviceDate) {
    console.log('❌ Service date parsing failed, returning false');
    return false;
  }
  
  const result = serviceDate < today;
  console.log('🎯 RESULT: serviceDate < today =', result);
  console.log('🎯 This means car will be', result ? 'HIDDEN ❌' : 'VISIBLE ✅');
  
  return result;
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
  const dateString = `${year}-${month}-${day}`;
  
  console.log('🗓️ getCurrentDateString generated:', dateString);
  console.log('⏰ At time:', today.toString());
  
  return dateString;
};