export const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim();
};

export const validateUserRegistration = (userData) => {
  const errors = [];
  const { name, email, phone, password } = userData;

  // Validate name
  if (!validateName(name)) {
    errors.push('Name must be at least 2 characters long');
  }

  // Validate email or phone (at least one required)
  if (!email && !phone) {
    errors.push('Either email or phone number is required');
  }

  if (email && !validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (phone && !validatePhone(phone)) {
    errors.push('Please provide a valid phone number');
  }

  // Validate password
  if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUserLogin = (userData) => {
  const errors = [];
  const { email, phone, password } = userData;

  // Validate email or phone (at least one required)
  if (!email && !phone) {
    errors.push('Either email or phone number is required');
  }

  if (email && !validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (phone && !validatePhone(phone)) {
    errors.push('Please provide a valid phone number');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
