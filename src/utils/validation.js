// Input Sanitization
export const sanitizeInput = (input, maxLength = 1000) => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '');
};

// License Plate Validation
export const validateLicensePlate = (plate, plateType) => {
  if (!plate || typeof plate !== 'string') return false;
  
  const tunisianPattern = /^[0-9]{1,4}\s?[A-Z]{2,3}\s?[0-9]{1,4}$/i;
  const internationalPattern = /^[A-Z0-9\-\s]{3,15}$/i;
  
  if (plateType === 'tunisienne') {
    return tunisianPattern.test(plate.trim());
  }
  return internationalPattern.test(plate.trim());
};

// Phone Number Validation
export const validatePhone = (phone) => {
  if (!phone) return true; // Optional field
  const phonePattern = /^(\+216)?[2-9][0-9]{7}$/;
  return phonePattern.test(phone.replace(/\s/g, ''));
};

// Safe Number Parsing
export const safeParseNumber = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : Math.max(0, parsed);
};

// Date Validation
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date.getFullYear() >= 2020;
};
