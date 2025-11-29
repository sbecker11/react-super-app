/**
 * Centralized Validation Configuration
 * 
 * This file keeps all validation rules and error messages in sync.
 * Update rules and messages here - they'll automatically be used in:
 * - Yup validation schema
 * - Error messages
 * - UI requirements display
 */

export const validationConfig = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    messages: {
      required: 'Name is required',
      minLength: (min) => `Name must be at least ${min} characters`,
      maxLength: (max) => `Name must be less than ${max} characters`,
      pattern: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    },
  },
  
  email: {
    example: 'user@example.com',
    messages: {
      required: 'Email is required',
      invalid: (example) => `Invalid email address. Example: ${example}`,
    },
  },
  
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    messages: {
      required: 'Password is required',
      // Rule descriptions for UI display and error messages
      rules: {
        minLength: (min) => `At least ${min} characters`,
        uppercase: '1 uppercase letter',
        lowercase: '1 lowercase letter',
        number: '1 digit',
        specialChar: '1 symbol',
      },
    },
  },
};

/**
 * Get password requirements as an array for UI display
 */
export const getPasswordRequirements = () => {
  const config = validationConfig.password;
  const rules = [];
  
  if (config.requireUppercase) {
    rules.push(config.messages.rules.uppercase);
  }
  if (config.requireLowercase) {
    rules.push(config.messages.rules.lowercase);
  }
  if (config.requireNumber) {
    rules.push(config.messages.rules.number);
  }
  if (config.requireSpecialChar) {
    rules.push(config.messages.rules.specialChar);
  }
  
  // Add min length first
  return [
    config.messages.rules.minLength(config.minLength),
    ...rules,
  ];
};

/**
 * Validate password and return all broken rules
 */
export const validatePasswordRules = (password) => {
  const config = validationConfig.password;
  const brokenRules = [];
  
  if (!password || password.length < config.minLength) {
    brokenRules.push(config.messages.rules.minLength(config.minLength).replace('At least ', 'at least '));
  }
  
  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    brokenRules.push(config.messages.rules.uppercase);
  }
  
  if (config.requireLowercase && !/[a-z]/.test(password)) {
    brokenRules.push(config.messages.rules.lowercase);
  }
  
  if (config.requireNumber && !/[0-9]/.test(password)) {
    brokenRules.push(config.messages.rules.number);
  }
  
  if (config.requireSpecialChar && !config.specialChars.test(password)) {
    brokenRules.push(config.messages.rules.specialChar);
  }
  
  if (brokenRules.length === 0) {
    return null; // No broken rules
  }
  
  return `requires ${brokenRules.join(', ')}`;
};

